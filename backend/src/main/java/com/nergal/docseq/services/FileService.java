package com.nergal.docseq.services;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.nergal.docseq.dto.files.FileResponseDTO;
import com.nergal.docseq.dto.folders.FolderUpdateDTO;
import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.helpers.mappers.FileMapper;
import com.nergal.docseq.repositories.FileRepository;
import com.nergal.docseq.repositories.FolderRepository;
import com.nergal.docseq.repositories.UserRepository;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final PermissionService permissionService;

    public FileService(
            FileRepository fileRepository,
            FolderRepository folderRepository,
            UserRepository userRepository,
            StorageService storageService,
            PermissionService permissionService) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.permissionService = permissionService;
    }

    @Transactional
    public FileResponseDTO upload(
            MultipartFile file,
            UUID folderId,
            JwtAuthenticationToken token) {

        validatePdf(file);

        User user = getUser(token);

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        folderId,
                        user.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("Folder not found"));

        // New permission check
        if (!permissionService.checkPermission(folderId, true, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for this folder.");
        }

        File entity = new File();
        entity.setName(file.getOriginalFilename());
        entity.setSize(file.getSize());
        entity.setObjectKey(file.getOriginalFilename());
        entity.setTown(user.getTown());
        entity.setContentType(file.getContentType());
        entity.setFolder(folder);
        entity.setUploadedBy(user);

        fileRepository.save(entity);

        // upload físico
        String storageKey = storageService.upload(file, entity.getFileId());
        entity.setObjectKey(storageKey);

        return FileMapper.toResponse(entity);
    }

    @Transactional
    public void softDelete(UUID fileId, JwtAuthenticationToken token) {

        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTown().getTownId());

        // New permission check
        if (!permissionService.checkPermission(fileId, false, PermissionType.DELETE, token)) {
            throw new ForbiddenException("You do not have delete permission for this file.");
        }

        file.setDeletedAt(Instant.now());
        file.setDeletedBy(getUser(token));
        fileRepository.save(file);
    }

    @Transactional
    public void restore(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = fileRepository
                .findByFileIdAndTownTownIdAndDeletedAtIsNotNull(fileId, user.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("File not found"));

        // New permission check
        if (!permissionService.checkPermission(fileId, false, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to restore this file.");
        }

        if (file.getFolder() != null) {
            restoreFolderAncestors(file.getFolder(), user);
        }

        file.setDeletedAt(null);
        file.setDeletedBy(null);
        fileRepository.save(file);
    }

    private void restoreFolderAncestors(Folder folder, User user) {
        List<Folder> foldersToRestore = new ArrayList<>();
        Folder current = folder;

        while (current != null) {
            if (current.getDeletedAt() != null) {
                foldersToRestore.add(current);
            }
            current = current.getParent();
        }

        if (!foldersToRestore.isEmpty()) {
            foldersToRestore.forEach(f -> {
                f.setDeletedAt(null);
                f.setDeletedBy(null);
            });
            folderRepository.saveAll(foldersToRestore);
        }
    }

    @Transactional
    public void permanentDelete(UUID fileId, JwtAuthenticationToken token) {

        User user = getUser(token);

        File file = fileRepository
                .findByFileIdAndTownTownIdAndDeletedAtIsNotNull(
                        fileId,
                        user.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("File not found"));

        if (file.getDeletedAt() == null) {
            throw new BadRequestException("File must be in trash");
        }

        // New permission check
        if (!permissionService.checkPermission(fileId, false, PermissionType.DELETE, token)) {
            throw new ForbiddenException("You do not have delete permission to permanently delete this file.");
        }

        storageService.delete(file.getObjectKey());
        fileRepository.delete(file);
    }

    @Transactional
    public void rename(UUID fileId, FolderUpdateDTO dto, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTown().getTownId());

        // New permission check
        if (!permissionService.checkPermission(fileId, false, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to rename this file.");
        }

        if (dto.name() != null) {
            file.setName(dto.name() + file.getContentType().replace("application/", "."));
            fileRepository.save(file);
        }
    }

    @Transactional
    public void move(UUID fileId, UUID targetFolderId, JwtAuthenticationToken token) {
        User user = getUser(token);
        File file = getFileBelongsOrganization(fileId, user.getTown().getTownId());
        Folder targetFolder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        targetFolderId,
                        user.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("Target folder not found"));

        // New permission checks
        if (!permissionService.checkPermission(fileId, false, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for the original file.");
        }
        if (!permissionService.checkPermission(targetFolderId, true, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for the target folder.");
        }

        file.setFolder(targetFolder);
        fileRepository.save(file);
    }

    @Transactional
    public void toggleFavorite(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTown().getTownId());

        // New permission check
        if (!permissionService.checkPermission(fileId, false, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to favorite/unfavorite this file.");
        }

        file.setFavorite(!file.getFavorite());
        fileRepository.save(file);
    }

    @Transactional
    public String generateViewUrl(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTown().getTownId());

        // New permission check
        if (!permissionService.checkPermission(fileId, false, PermissionType.READ, token)) {
            throw new ForbiddenException("You do not have read permission for this file.");
        }

        file.setLastSeen(Instant.now());
        fileRepository.save(file);
        return storageService.generateTemporaryUrl(file.getObjectKey());
    }

    /* ========================= */
    /* Helpers */
    /* ========================= */

    private void validatePdf(MultipartFile file) {

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new BadRequestException("Only PDF allowed");
        }
    }

    private File getFileBelongsOrganization(UUID fileId, UUID townId) {
        return fileRepository
                .findByFileIdAndTownTownIdAndDeletedAtIsNull(
                        fileId, townId)
                .orElseThrow(() -> new NotFoundException("File not found"));
    }

    private User getUser(JwtAuthenticationToken token) {
        return userRepository.getReferenceById(UUID.fromString(token.getName()));
    }
}
