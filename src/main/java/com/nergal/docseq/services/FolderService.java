package com.nergal.docseq.services;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.dto.folders.FolderRequestDTO;
import com.nergal.docseq.dto.folders.FolderContentResponse;
import com.nergal.docseq.dto.folders.FolderTreeResponseDTO;
import com.nergal.docseq.dto.folders.FolderUpdateDTO;
import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.helpers.mappers.FileMapper;
import com.nergal.docseq.helpers.mappers.FolderMapper;
import com.nergal.docseq.helpers.mappers.FolderTreeBuilder;
import com.nergal.docseq.helpers.mappers.PageMapper;
import com.nergal.docseq.repositories.FileRepository;
import com.nergal.docseq.repositories.FolderRepository;
import com.nergal.docseq.repositories.UserRepository;

@Service
public class FolderService {
    
    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public FolderService(
        FolderRepository folderRepository, 
        FileRepository fileRepository,
        UserRepository userRepository,
        StorageService storageService
    ) {
        this.folderRepository = folderRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    // List root folders
    @Transactional(readOnly = true)
    public FolderContentResponse listRootFolders(
            Pageable pageable,
            JwtAuthenticationToken token
    ) {
        var town_id = getTownId(token);

        var folderPage = folderRepository
            .findByTownTownIdAndParentIsNullAndDeletedAtIsNull(
                    town_id,
                    pageable
            )
            .map(FolderMapper::toDTO);

        var filePage = fileRepository
            .findByFolderFolderIdAndDeletedAtIsNull(
                null, 
                pageable
            ).map(FileMapper::toResponse);

        return new FolderContentResponse(
            PageMapper.toPageResponse(
                    folderPage
            ),
            PageMapper.toPageResponse(
                    filePage
            )
        );
    }

    // List subfolders
    @Transactional(readOnly = true)
    public FolderContentResponse listChildren(
            UUID parentId,
            Pageable pageable,
            JwtAuthenticationToken token
    ) {
        var town_id = getTownId(token);

        var folder = folderRepository.findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                parentId, 
                town_id
            )
            .orElseThrow(() -> new NotFoundException("folder not found"));

        var folderPage = folderRepository
                .findByParentFolderIdAndDeletedAtIsNull(parentId, pageable)
                .map(FolderMapper::toDTO);

        var filePage = fileRepository
            .findByFolderFolderIdAndDeletedAtIsNull(
                folder.getFolderId(), 
                pageable
            )
            .map(FileMapper::toResponse);

        return new FolderContentResponse(
            PageMapper.toPageResponse(
                    folderPage
            ),
            PageMapper.toPageResponse(
                    filePage
            )
        );
    }

    // Complete tree
    @Transactional(readOnly = true)
    public List<FolderTreeResponseDTO> getFolderTree(
            JwtAuthenticationToken token
    ) {
        var townId = getTownId(token);

        var folders = folderRepository
                .findByTownTownIdAndDeletedAtIsNull(townId);

        return FolderTreeBuilder.build(folders);
    }

    // Create folder
    @Transactional
    public void create(FolderRequestDTO dto, JwtAuthenticationToken token) {
        var user = getUser(token);
        
        Folder parent = null;
        if (dto.parentId() != null) {
            parent = folderRepository.findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                    dto.parentId(),
                    user.getTown().getTownId()
            )
            .orElseThrow(() -> new NotFoundException("parent folder not found"));
        }

        if (folderRepository.existsByNameAndParentAndDeletedAtIsNull(dto.name(), parent)) {
            throw new ConflictException("Folder already exists");
        }

        Folder folder = new Folder();
        folder.setName(dto.name());
        folder.setParent(parent);
        folder.setTown(user.getTown());
        folder.setCreatedBy(user);

        folderRepository.save(folder);
    }

    // Update folder
    @Transactional
    public void update(
            UUID folderId,
            FolderUpdateDTO dto,
            JwtAuthenticationToken token
    ) {
        var user = getUser(token);

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        folderId,
                        user.getTown().getTownId()
                )
                .orElseThrow(() -> new NotFoundException("folder not found"));

        if (dto.name() != null &&
            folderRepository.existsByNameAndParentAndDeletedAtIsNull(dto.name(), folder.getParent())) {
            throw new ConflictException("Folder already exists");
        }

        if (dto.name() != null) folder.setName(dto.name());
        if (dto.favorite() != null) folder.setFavorite(dto.favorite());
    }

    // move folder
    @Transactional
    public void move(UUID folderId, UUID targetFolderId, JwtAuthenticationToken token) {

        var userId = UUID.fromString(token.getName());
        UUID townId = getTownId(token);

        Folder folder = folderRepository
            .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                folderId, townId
            )
            .orElseThrow(() -> new NotFoundException("Folder not found"));

        Folder target = folderRepository
            .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                targetFolderId, townId
            )
            .orElseThrow(() -> new NotFoundException("Target folder not found"));

        if (folder.getFolderId().equals(target.getFolderId())) {
            throw new BadRequestException("Folder cannot be its own parent");
        }

        if (!folder.getTown().getTownId()
                .equals(target.getTown().getTownId())) {
            throw new ForbiddenException("Different organizations");
        }

        if (folder.getDeletedAt() != null || target.getDeletedAt() != null) {
            throw new BadRequestException("Cannot move deleted folders");
        }

        if (isDescendant(folder, target)) {
            throw new BadRequestException("Cannot move folder into its own subtree");
        }

        folder.setParent(target);
        folder.setUpdatedBy(userRepository.getReferenceById(userId));

        folderRepository.save(folder);
    }

    private boolean isDescendant(Folder source, Folder target) {
        Folder current = target.getParent();

        while (current != null) {
            if (current.getFolderId().equals(source.getFolderId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    // Soft delete
    @Transactional
    public void softDelete(UUID folderId, JwtAuthenticationToken token) {
        var user = getUser(token);

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        folderId,
                        user.getTown().getTownId()
                )
                .orElseThrow(() -> new NotFoundException("folder not found"));

        softDeleteRecursively(folder, user);
    }

    private void collectForSoftDelete(
        Folder folder,
        List<Folder> folders,
        List<File> files
    ) {
        if (folder.getDeletedAt() != null) return;

        folders.add(folder);
        files.addAll(fileRepository.findByFolderAndDeletedAtIsNull(folder));

        List<Folder> children =
                folderRepository.findByParentAndDeletedAtIsNull(folder);

        for (Folder child : children) {
            collectForSoftDelete(child, folders, files);
        }
    }


    @Transactional
    public void softDeleteRecursively(Folder root, User deletedBy) {

        Instant now = Instant.now();

        List<Folder> folders = new ArrayList<>();
        List<File> files = new ArrayList<>();

        collectForSoftDelete(root, folders, files);

        for (Folder folder : folders) {
            folder.setDeletedAt(now);
            folder.setDeletedBy(deletedBy);
        }

        for (File file : files) {
            file.setDeletedAt(now);
            file.setDeletedBy(deletedBy);
        }
    }

    // permanent delete
    @Transactional
    public void permanentDelete(UUID folderId, JwtAuthenticationToken token) {

        UUID townId = getTownId(token);

        Folder folder = folderRepository.findByFolderIdAndTownTownIdAndDeletedAtIsNotNull(
            folderId, townId
        )
        .orElseThrow(() -> new NotFoundException("Folder not found"));

        if (folder.getDeletedAt() == null) {
            throw new BadRequestException("Folder must be in trash before permanent delete");
        }
        permanentDeleteRecursively(folder);
    }

    private void collectForPermanentDelete(
        Folder root,
        List<Folder> folders,
        List<File> files
    ) {
        folders.add(root);

        files.addAll(
            fileRepository.findByFolderFolderId(root.getFolderId())
        );

        List<Folder> children =
                folderRepository.findByParentFolderId(root.getFolderId());

        for (Folder child : children) {
            collectForPermanentDelete(child, folders, files);
        }
    }


    @Transactional
    public void permanentDeleteRecursively(Folder root) {

        List<Folder> folders = new ArrayList<>();
        List<File> files = new ArrayList<>();

        collectForPermanentDelete(root, folders, files);

        fileRepository.deleteAll(files);
        folderRepository.deleteAll(folders);

        for (File file : files) {
            try {
                storageService.delete(file.getObjectKey());
            } catch (Exception e) {
                System.out.println("Failed to delete file from storage");
            }
        }
    }


    // List trash can
    @Transactional(readOnly = true)
    public FolderContentResponse listTrash(
            Pageable pageable,
            JwtAuthenticationToken token
    ) {
        var townId = getTownId(token);

        var folderPage = folderRepository
            .findByTownTownIdAndDeletedAtIsNotNull(
                townId,
                pageable
            )
            .map(FolderMapper::toDTO);

        var filePage = fileRepository
            .findByTownTownIdAndDeletedAtIsNotNull(
                townId,
                pageable
            )
            .map(FileMapper::toResponse);

        return new FolderContentResponse(
            PageMapper.toPageResponse(
                    folderPage
            ),
            PageMapper.toPageResponse(
                    filePage
            )
        );
    }

    // Restore folder with children
    @Transactional
    public void restore(UUID folderId, JwtAuthenticationToken token) {
        UUID townId = getTownId(token); 

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNotNull(
                    folderId, townId
                )
                .orElseThrow(() -> new NotFoundException("folder not found"));

        restoreRecursively(folder);
    }

    private void collectForRestore(
        Folder folder,
        List<Folder> folders,
        List<File> files
    ) {
        if (folder.getDeletedAt() == null) return;

        folders.add(folder);

        files.addAll(
            fileRepository.findByFolderAndDeletedAtIsNotNull(folder)
        );

        List<Folder> children =
            folderRepository.findByParentAndDeletedAtIsNotNull(folder);

        for (Folder child : children) {
            collectForRestore(child, folders, files);
        }
    }


    @Transactional
    public void restoreRecursively(Folder root) {

        List<Folder> folders = new ArrayList<>();
        List<File> files = new ArrayList<>();

        collectForRestore(root, folders, files);

        for (Folder folder : folders) {
            folder.setDeletedAt(null);
            folder.setDeletedBy(null);
        }

        for (File file : files) {
            file.setDeletedAt(null);
            file.setDeletedBy(null);
        }
    }

    // Favorite
    @Transactional
    public void toggleFavorite(UUID folderId, JwtAuthenticationToken token) {
        var user = getUser(token);

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        folderId,
                        user.getTown().getTownId()
                )
                .orElseThrow(() -> new NotFoundException("folder not found"));

        folder.setFavorite(!folder.getFavorite());
    }

    // Auxiliary methods
    private User getUser(JwtAuthenticationToken token) {
        return userRepository.findById(UUID.fromString(token.getName()))
                .orElseThrow(() -> new NotFoundException("user not found"));
    }

    private UUID getTownId(JwtAuthenticationToken token) {
        return getUser(token).getTown().getTownId();
    }
}
