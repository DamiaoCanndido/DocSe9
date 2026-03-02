package com.nergal.docseq.services;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.nergal.docseq.dto.files.FileUpdateDTO;
import com.nergal.docseq.dto.nodes.NodeResponseDTO;
import com.nergal.docseq.entities.Node;
import com.nergal.docseq.entities.NodeType;
import com.nergal.docseq.entities.NodeUserMetadata;
import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.UserV2;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.helpers.mappers.NodeMapper;
import com.nergal.docseq.repositories.FileV2Repository;
import com.nergal.docseq.repositories.NodeRepository;
import com.nergal.docseq.repositories.UserV2Repository;

@Service
public class FileV2Service {

    private final FileV2Repository fileRepository;
    private final NodeRepository nodeRepository;
    private final UserV2Repository userRepository;
    private final StorageService storageService;
    private final PermissionV2Service permissionService;
    private final com.nergal.docseq.repositories.NodeUserMetadataRepository nodeUserMetadataRepository;

    public FileV2Service(
            FileV2Repository fileRepository,
            NodeRepository nodeRepository,
            UserV2Repository userRepository,
            StorageService storageService,
            PermissionV2Service permissionService,
            com.nergal.docseq.repositories.NodeUserMetadataRepository nodeUserMetadataRepository) {
        this.fileRepository = fileRepository;
        this.nodeRepository = nodeRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.permissionService = permissionService;
        this.nodeUserMetadataRepository = nodeUserMetadataRepository;
    }

    @Transactional
    public NodeResponseDTO upload(
            MultipartFile file,
            UUID folderId,
            JwtAuthenticationToken token) {

        validatePdf(file);

        UserV2 user = getUser(token);

        Node folder = nodeRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        folderId,
                        user.getTown().getTownId(),
                        NodeType.folder)
                .orElseThrow(() -> new NotFoundException("Folder not found"));

        // Check for folder permissions.
        if (!permissionService.checkPermission(folderId, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for this folder.");
        }

        Node entity = new Node();
        entity.setName(file.getOriginalFilename());
        entity.setNodeType(NodeType.file);
        entity.setSize(file.getSize());
        entity.setObjectKey(file.getOriginalFilename());
        entity.setTown(user.getTown());
        entity.setContentType(file.getContentType());
        entity.setParent(folder);
        entity.setCreatedBy(user);

        fileRepository.save(entity);

        // upload físico
        String storageKey = storageService.upload(file, entity.getNodeId());
        entity.setObjectKey(storageKey);

        return NodeMapper.toDTO(entity);
    }

    @Transactional
    public void softDelete(UUID fileId, JwtAuthenticationToken token) {

        UserV2 user = getUser(token);

        Node file = getFileBelongsOrganization(fileId, user.getTown().getTownId());

        // New permission check
        if (!permissionService.checkPermission(file.getNodeId(), PermissionType.DELETE, token)) {
            throw new ForbiddenException("You do not have delete permission for this file.");
        }

        file.setDeletedAt(Instant.now());
        file.setDeletedBy(user);
        fileRepository.save(file);
    }

    @Transactional
    public void restore(UUID fileId, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node file = fileRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNotNull(
                        fileId,
                        user.getTown().getTownId(),
                        NodeType.file)
                .orElseThrow(() -> new NotFoundException("File not found"));

        // New permission check
        if (!permissionService.checkPermission(file.getNodeId(), PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to restore this file.");
        }

        if (file.getParent() != null) {
            restoreFolderAncestors(file.getParent(), user);
        }

        file.setDeletedAt(null);
        file.setDeletedBy(null);
        file.setRestoredBy(user);
        file.setUpdatedBy(user);
        fileRepository.save(file);
    }

    private void restoreFolderAncestors(Node folder, UserV2 user) {
        List<Node> foldersToRestore = new ArrayList<>();
        Node current = folder;

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
                f.setRestoredBy(user);
                f.setUpdatedBy(user);
            });
            nodeRepository.saveAll(foldersToRestore);
        }
    }

    @Transactional
    public void permanentDelete(UUID fileId, JwtAuthenticationToken token) {

        UserV2 user = getUser(token);

        Node file = fileRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNotNull(
                        fileId,
                        user.getTown().getTownId(),
                        NodeType.file)
                .orElseThrow(() -> new NotFoundException("File not found"));

        if (file.getDeletedAt() == null) {
            throw new BadRequestException("File must be in trash");
        }

        // New permission check
        if (!permissionService.checkPermission(file.getNodeId(), PermissionType.DELETE, token)) {
            throw new ForbiddenException("You do not have delete permission to permanently delete this file.");
        }

        storageService.delete(file.getObjectKey());
        fileRepository.delete(file);
    }

    @Transactional
    public void rename(UUID fileId, FileUpdateDTO dto, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node file = getFileBelongsOrganization(fileId, user.getTown().getTownId());

        // New permission check
        if (!permissionService.checkPermission(file.getNodeId(), PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to rename this file.");
        }

        if (dto.name() != null) {
            file.setName(dto.name() + file.getContentType().replace("application/", "."));
            file.setUpdatedBy(user);
            fileRepository.save(file);
        }
    }

    @Transactional
    public void move(UUID fileId, UUID targetFolderId, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node file = getFileBelongsOrganization(fileId, user.getTown().getTownId());
        Node targetFolder = nodeRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        targetFolderId,
                        user.getTown().getTownId(),
                        NodeType.folder)
                .orElseThrow(() -> new NotFoundException("Target folder not found"));

        // New permission checks
        if (!permissionService.checkPermission(file.getNodeId(), PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for the original file.");
        }
        if (!permissionService.checkPermission(targetFolderId, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for the target folder.");
        }

        file.setParent(targetFolder);
        file.setUpdatedBy(user);
        fileRepository.save(file);
    }

    @Transactional
    public void toggleFavorite(UUID fileId, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node file = getFileBelongsOrganization(fileId, user.getTown().getTownId());

        // New permission check
        if (!permissionService.checkPermission(file.getNodeId(), PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to favorite/unfavorite this file.");
        }

        var metadata = nodeUserMetadataRepository
                .findByNodeNodeIdAndUserUserId(file.getNodeId(), user.getUserId())
                .orElseGet(() -> new NodeUserMetadata(file, user));

        metadata.setFavorite(!metadata.getFavorite());
        nodeUserMetadataRepository.save(metadata);
    }

    @Transactional
    public String generateViewUrl(UUID fileId, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node file = getFileBelongsOrganization(fileId, user.getTown().getTownId());

        // New permission check
        if (!permissionService.checkPermission(file.getNodeId(), PermissionType.READ, token)) {
            throw new ForbiddenException("You do not have read permission for this file.");
        }

        var metadata = nodeUserMetadataRepository
                .findByNodeNodeIdAndUserUserId(file.getNodeId(), user.getUserId())
                .orElseGet(() -> new NodeUserMetadata(file, user));

        metadata.setLastSeen(Instant.now());
        nodeUserMetadataRepository.save(metadata);

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

    private Node getFileBelongsOrganization(UUID fileId, UUID townId) {
        return fileRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        fileId, townId, NodeType.file)
                .orElseThrow(() -> new NotFoundException("File not found"));
    }

    private UserV2 getUser(JwtAuthenticationToken token) {
        return userRepository.getReferenceById(UUID.fromString(token.getName()));
    }
}
