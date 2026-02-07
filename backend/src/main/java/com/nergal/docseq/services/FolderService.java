package com.nergal.docseq.services;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import java.util.Collections;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.stream.Collectors;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.dto.folders.FolderContentResponse;
import com.nergal.docseq.dto.folders.FolderRequestDTO;
import com.nergal.docseq.dto.folders.FolderTreeResponseDTO;
import com.nergal.docseq.dto.folders.FolderUpdateDTO;
import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.helpers.mappers.FileMapper;
import com.nergal.docseq.helpers.mappers.FolderMapper;
import com.nergal.docseq.helpers.mappers.FolderTreeBuilder;
import com.nergal.docseq.helpers.mappers.PageMapper;
import com.nergal.docseq.helpers.specifications.FileSpecifications;
import com.nergal.docseq.helpers.specifications.FolderSpecifications;
import com.nergal.docseq.repositories.FileRepository;
import com.nergal.docseq.repositories.FolderRepository;
import com.nergal.docseq.repositories.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final PermissionService permissionService; // New

    public FolderService(
            FolderRepository folderRepository,
            FileRepository fileRepository,
            UserRepository userRepository,
            StorageService storageService,
            PermissionService permissionService) { // New
        this.folderRepository = folderRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.permissionService = permissionService; // New
    }

    @Transactional(readOnly = true)
    public FolderContentResponse listRootFolders(
            Pageable pageable,
            String name,
            JwtAuthenticationToken token) {
        User user = getUser(token);
        // Only admins and managers can list all folders in their town for now.
        // For basic users, this would require filtering based on explicit read
        // permissions, which is complex.
        if (user.getRole().getName().equals(Role.Values.basic)) {
            throw new ForbiddenException("Basic users cannot list root folders without explicit read permissions.");
        }

        var town_id = user.getTown().getTownId(); // Changed to use user.getTown() directly

        var folderPage = folderRepository
                .findAll(FolderSpecifications.withRootFilters(town_id, name), pageable)
                .map(FolderMapper::toDTO);

        var filePage = fileRepository
                .findAll(FileSpecifications.withSubFoldersFilters(
                        town_id,
                        // This logic needs to be re-evaluated as folderPage.getContent() might be empty
                        folderPage.getContent().isEmpty() ? null : folderPage.getContent().get(0).parentId(),
                        name), pageable)
                .map(FileMapper::toResponse);

        return new FolderContentResponse(
                PageMapper.toPageResponse(
                        folderPage),
                PageMapper.toPageResponse(
                        filePage));
    }

    // List subfolders
    @Transactional(readOnly = true)
    public FolderContentResponse listChildren(
            UUID parentId,
            String name,
            Pageable pageable,
            JwtAuthenticationToken token) {
        User user = getUser(token);
        // Basic users need explicit READ permission for the parent folder
        if (user.getRole().getName().equals(Role.Values.basic)) {
            if (!permissionService.checkPermission(parentId, true, PermissionType.READ, token)) {
                throw new ForbiddenException("You do not have read permission for this folder.");
            }
        }

        var town_id = user.getTown().getTownId();

        folderRepository.findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                parentId,
                town_id)
                .orElseThrow(() -> new NotFoundException("folder not found"));
        var townId = getTownId(token);

        var folderPage = folderRepository
                .findAll(FolderSpecifications.withSubFoldersFilters(townId, parentId, name), pageable)
                .map(FolderMapper::toDTO);

        var filePage = fileRepository
                .findAll(FileSpecifications.withSubFoldersFilters(town_id, parentId, name), pageable)
                .map(FileMapper::toResponse);

        return new FolderContentResponse(
                PageMapper.toPageResponse(
                        folderPage),
                PageMapper.toPageResponse(
                        filePage));
    }

    // Complete tree
    @Transactional(readOnly = true)
    public List<FolderTreeResponseDTO> getFolderTree(
            JwtAuthenticationToken token) {
        User user = getUser(token);
        if (user.getRole().getName().equals(Role.Values.basic)) {
            throw new ForbiddenException(
                    "Basic users cannot view the full folder tree without explicit read permissions.");
        }
        var townId = user.getTown().getTownId();

        var folders = folderRepository
                .findByTownTownIdAndDeletedAtIsNull(townId);

        return FolderTreeBuilder.build(folders);
    }

    // Create folder
    @Transactional
    public void create(FolderRequestDTO dto, JwtAuthenticationToken token) {
        var user = getUser(token);

        if (user.getRole().getName().equals(Role.Values.admin)) {
            throw new ForbiddenException("Admins cannot create folders");
        }

        Folder parent = null;
        if (dto.parentId() != null) {
            parent = folderRepository.findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                    dto.parentId(),
                    user.getTown().getTownId())
                    .orElseThrow(() -> new NotFoundException("parent folder not found"));

            // New permission check for parent folder
            if (!permissionService.checkPermission(dto.parentId(), true, PermissionType.WRITE, token)) {
                throw new ForbiddenException("You do not have write permission for the parent folder.");
            }
        } else { // Creating a root folder
            if (user.getRole().getName().equals(Role.Values.basic)) {
                throw new ForbiddenException("Basic users cannot create root folders.");
            }
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
            JwtAuthenticationToken token) {
        var user = getUser(token);

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        folderId,
                        user.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("folder not found"));

        // New permission check
        if (!permissionService.checkPermission(folderId, true, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for this folder.");
        }

        if (dto.name() != null &&
                folderRepository.existsByNameAndParentAndDeletedAtIsNull(dto.name(), folder.getParent())) {
            throw new ConflictException("Folder already exists");
        }

        if (dto.name() != null)
            folder.setName(dto.name());
        if (dto.favorite() != null)
            folder.setFavorite(dto.favorite());
        folderRepository.save(folder);
    }

    // move folder
    @Transactional
    public void move(UUID folderId, UUID targetFolderId, JwtAuthenticationToken token) {

        var userId = UUID.fromString(token.getName());
        UUID townId = getTownId(token);

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        folderId, townId)
                .orElseThrow(() -> new NotFoundException("Folder not found"));

        Folder target = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        targetFolderId, townId)
                .orElseThrow(() -> new NotFoundException("Target folder not found"));

        // New permission checks
        if (!permissionService.checkPermission(folderId, true, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for the source folder.");
        }
        if (!permissionService.checkPermission(targetFolderId, true, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for the target folder.");
        }

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
                        user.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("folder not found"));

        // New permission check
        if (!permissionService.checkPermission(folderId, true, PermissionType.DELETE, token)) {
            throw new ForbiddenException("You do not have delete permission for this folder.");
        }

        softDeleteRecursively(folder, user);
        folderRepository.save(folder);
    }

    @Transactional
    public void softDeleteRecursively(Folder root, User deletedBy) {
        Instant now = Instant.now();

        List<Folder> allFoldersInTown = folderRepository.findByTownTownIdAndDeletedAtIsNull(root.getTown().getTownId());
        Map<Folder, List<Folder>> parentToChildrenMap = allFoldersInTown.stream()
                .filter(f -> f.getParent() != null)
                .collect(Collectors.groupingBy(Folder::getParent));

        List<Folder> foldersToDelete = new ArrayList<>();
        Queue<Folder> queue = new LinkedList<>();

        if (root.getDeletedAt() == null) {
            queue.add(root);
            foldersToDelete.add(root);
        }

        while (!queue.isEmpty()) {
            Folder current = queue.poll();
            List<Folder> children = parentToChildrenMap.getOrDefault(current, Collections.emptyList());
            for (Folder child : children) {
                if (child.getDeletedAt() == null) {
                    foldersToDelete.add(child);
                    queue.add(child);
                }
            }
        }

        if (foldersToDelete.isEmpty()) {
            return;
        }

        List<File> filesToDelete = fileRepository.findByFolderInAndDeletedAtIsNull(foldersToDelete);

        for (Folder folder : foldersToDelete) {
            folder.setDeletedAt(now);
            folder.setDeletedBy(deletedBy);
        }

        for (File file : filesToDelete) {
            file.setDeletedAt(now);
            file.setDeletedBy(deletedBy);
        }
    }

    // permanent delete
    @Transactional
    public void permanentDelete(UUID folderId, JwtAuthenticationToken token) {

        UUID townId = getTownId(token);

        Folder folder = folderRepository.findByFolderIdAndTownTownIdAndDeletedAtIsNotNull(
                folderId, townId)
                .orElseThrow(() -> new NotFoundException("Folder not found"));

        if (folder.getDeletedAt() == null) {
            throw new BadRequestException("Folder must be in trash before permanent delete");
        }

        // New permission check
        if (!permissionService.checkPermission(folderId, true, PermissionType.DELETE, token)) {
            throw new ForbiddenException("You do not have delete permission to permanently delete this folder.");
        }

        permanentDeleteRecursively(folder);
    }

    @Transactional
    public void permanentDeleteRecursively(Folder root) {
        List<Folder> allFoldersInTown = folderRepository.findByTownTownId(root.getTown().getTownId());
        Map<Folder, List<Folder>> parentToChildrenMap = allFoldersInTown.stream()
                .filter(f -> f.getParent() != null)
                .collect(Collectors.groupingBy(Folder::getParent));

        List<Folder> foldersToDelete = new ArrayList<>();
        Queue<Folder> queue = new LinkedList<>();

        queue.add(root);
        foldersToDelete.add(root);

        while (!queue.isEmpty()) {
            Folder current = queue.poll();
            List<Folder> children = parentToChildrenMap.getOrDefault(current, Collections.emptyList());
            foldersToDelete.addAll(children);
            queue.addAll(children);
        }

        if (foldersToDelete.isEmpty()) {
            return;
        }

        List<File> filesToDelete = fileRepository.findByFolderIn(foldersToDelete);

        fileRepository.deleteAll(filesToDelete);
        folderRepository.deleteAll(foldersToDelete);

        for (File file : filesToDelete) {
            try {
                storageService.delete(file.getObjectKey());
            } catch (Exception e) {
                log.error("Failed to delete file from storage: {}", e.getMessage());
            }
        }
    }

    // List trash can
    @Transactional(readOnly = true)
    public FolderContentResponse listTrash(
            Pageable pageable,
            JwtAuthenticationToken token) {
        var townId = getTownId(token);

        var folderPage = folderRepository
                .findByTownTownIdAndDeletedAtIsNotNull(
                        townId,
                        pageable)
                .map(FolderMapper::toDTO);

        var filePage = fileRepository
                .findByTownTownIdAndDeletedAtIsNotNull(
                        townId,
                        pageable)
                .map(FileMapper::toResponse);

        return new FolderContentResponse(
                PageMapper.toPageResponse(
                        folderPage),
                PageMapper.toPageResponse(
                        filePage));
    }

    // Restore folder with children
    @Transactional
    public void restore(UUID folderId, JwtAuthenticationToken token) {
        UUID townId = getTownId(token);

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNotNull(
                        folderId, townId)
                .orElseThrow(() -> new NotFoundException("folder not found"));

        // New permission check
        if (!permissionService.checkPermission(folderId, true, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to restore this folder.");
        }

        restoreRecursively(folder);
        folderRepository.save(folder);
    }

    @Transactional
    public void restoreRecursively(Folder root) {
        List<Folder> allDeletedFoldersInTown = folderRepository
                .findByTownTownIdAndDeletedAtIsNotNull(root.getTown().getTownId(), Pageable.unpaged()).getContent();
        Map<Folder, List<Folder>> parentToChildrenMap = allDeletedFoldersInTown.stream()
                .filter(f -> f.getParent() != null)
                .collect(Collectors.groupingBy(Folder::getParent));

        List<Folder> foldersToRestore = new ArrayList<>();
        Queue<Folder> queue = new LinkedList<>();

        if (root.getDeletedAt() != null) {
            queue.add(root);
            foldersToRestore.add(root);
        }

        while (!queue.isEmpty()) {
            Folder current = queue.poll();
            List<Folder> children = parentToChildrenMap.getOrDefault(current, Collections.emptyList());
            for (Folder child : children) {
                if (child.getDeletedAt() != null) {
                    foldersToRestore.add(child);
                    queue.add(child);
                }
            }
        }

        if (foldersToRestore.isEmpty()) {
            return;
        }

        List<File> filesToRestore = fileRepository.findByFolderInAndDeletedAtIsNotNull(foldersToRestore);

        for (Folder folder : foldersToRestore) {
            folder.setDeletedAt(null);
            folder.setDeletedBy(null);
        }

        for (File file : filesToRestore) {
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
                        user.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("folder not found"));

        // New permission check
        if (!permissionService.checkPermission(folderId, true, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to favorite/unfavorite this folder.");
        }

        folder.setFavorite(!folder.getFavorite());
        folderRepository.save(folder);
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
