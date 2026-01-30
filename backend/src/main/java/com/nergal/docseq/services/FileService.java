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
import com.nergal.docseq.entities.User;
import com.nergal.docseq.exception.BadRequestException;
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

    public FileService(
            FileRepository fileRepository,
            FolderRepository folderRepository,
            UserRepository userRepository,
            StorageService storageService) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
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

        file.setDeletedAt(Instant.now());
        file.setDeletedBy(getUser(token));
    }

    @Transactional
    public void restore(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = fileRepository
                .findByFileIdAndTownTownIdAndDeletedAtIsNotNull(fileId, user.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("File not found"));

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

        storageService.delete(file.getObjectKey());
        fileRepository.delete(file);
    }

    @Transactional
    public void rename(UUID fileId, FolderUpdateDTO dto, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTown().getTownId());
        if (dto.name() != null) {
            file.setName(dto.name() + file.getContentType().replace("application/", "."));
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
        file.setFolder(targetFolder);
    }

    @Transactional
    public void toggleFavorite(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTown().getTownId());
        file.setFavorite(!file.getFavorite());
    }

    @Transactional
    public String generateViewUrl(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTown().getTownId());
        file.setLastSeen(Instant.now());
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
