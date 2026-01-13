package com.nergal.docseq.services;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.nergal.docseq.controllers.dto.files.FileResponseDTO;
import com.nergal.docseq.controllers.dto.files.FileStream;
import com.nergal.docseq.controllers.dto.mappers.FileMapper;
import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.NotFoundException;
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
            JwtAuthenticationToken token
    ) {

        validatePdf(file);

        User user = getUser(token);

        Folder folder = folderRepository
            .findByFolderIdAndTownshipTownshipIdAndDeletedAtIsNull(
                folderId, 
                user.getTownship().getTownshipId()
            )
            .orElseThrow(() -> new NotFoundException("Folder not found"));

        File entity = new File();
        entity.setName(file.getOriginalFilename());
        entity.setSize(file.getSize());
        entity.setObjectKey(file.getOriginalFilename());
        entity.setTownship(user.getTownship());
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

        File file = getFileBelongsOrganization(fileId, user.getTownship().getTownshipId());

        file.setDeletedAt(Instant.now());
        file.setDeletedBy(getUser(token));
    }

    @Transactional
    public void restore(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = fileRepository
            .findByFileIdAndTownshipTownshipIdAndDeletedAtIsNotNull(
                fileId, 
                user.getTownship().getTownshipId()
            )
            .orElseThrow(() -> new NotFoundException("File not found"));

        file.setDeletedAt(null);
        file.setDeletedBy(null);
    }

    @Transactional
    public void permanentDelete(UUID fileId, JwtAuthenticationToken token) {

        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTownship().getTownshipId());

        if (file.getDeletedAt() == null) {
            throw new BadRequestException("File must be in trash");
        }

        storageService.delete(file.getObjectKey());
        fileRepository.delete(file);
    }

    @Transactional
    public void toggleFavorite(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTownship().getTownshipId());
        file.setFavorite(!file.getFavorite());
    }

    @Transactional
    public String generateViewUrl(UUID fileId, JwtAuthenticationToken token) {
        User user = getUser(token);

        File file = getFileBelongsOrganization(fileId, user.getTownship().getTownshipId());
        file.setLastSeen(Instant.now());
        return storageService.generateTemporaryUrl(file.getObjectKey());
    }

    public FileStream streamFile(UUID fileId, JwtAuthenticationToken token) {

        var township_id = userRepository
            .findById(UUID.fromString(token.getName()))
            .get().getTownship().getTownshipId();

        File file = fileRepository
            .findByFileIdAndTownshipTownshipIdAndDeletedAtIsNull(fileId, township_id)
            .orElseThrow(
                () -> new NotFoundException("file not found") 
            );

        Path path = Paths.get(file.getObjectKey());

        try {
            Resource resource = new UrlResource(path.toUri());

            return new FileStream(
                    resource,
                    file.getContentType(),
                    file.getName()
            );

        } catch (MalformedURLException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to load file"
            );
        }
    }

    /* ========================= */
    /* Helpers                   */
    /* ========================= */

    private void validatePdf(MultipartFile file) {

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new BadRequestException( "Only PDF allowed");
        }
    }

    private File getFileBelongsOrganization(UUID fileId, UUID townshipId) {
        return fileRepository
            .findByFileIdAndTownshipTownshipIdAndDeletedAtIsNull(
                fileId, townshipId
            )
            .orElseThrow(() -> new NotFoundException("File not found"));
    }

    private User getUser(JwtAuthenticationToken token) {
        return userRepository.getReferenceById(UUID.fromString(token.getName()));
    }
}

