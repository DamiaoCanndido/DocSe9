package com.nergal.docseq.services;

import com.nergal.docseq.dto.permissions.PermissionRequestDTO;
import com.nergal.docseq.dto.permissions.PermissionResponseDTO;
import com.nergal.docseq.entities.*;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.helpers.specifications.PermissionSpecifications;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.repositories.*;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final FolderRepository folderRepository;
    private final PermissionsCheckService permissionsCheckService;

    public PermissionService(PermissionRepository permissionRepository,
            UserRepository userRepository,
            FolderRepository folderRepository,
            PermissionsCheckService permissionsCheckService) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.folderRepository = folderRepository;
        this.permissionsCheckService = permissionsCheckService;
    }

    @Transactional
    public PermissionResponseDTO grantPermission(PermissionRequestDTO dto, JwtAuthenticationToken token) {
        User managerUser = getUser(token);
        validateManagerUser(managerUser);

        User targetUser = userRepository.findById(dto.userId())
                .orElseThrow(() -> new NotFoundException("Target user not found"));
        validateBasicUser(targetUser);
        validateSameTown(managerUser, targetUser);

        Folder folder = folderRepository
                .findByFolderIdAndTownTownIdAndDeletedAtIsNull(dto.nodeId(), managerUser.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("Folder not found or does not belong to your town"));

        boolean permissionExists = permissionRepository.findByUserUserIdAndFolderFolderIdAndPermissionType(
                targetUser.getUserId(), folder.getFolderId(), dto.permissionType()).isPresent();

        if (permissionExists) {
            throw new ConflictException("Permission already exists for this user and resource.");
        }

        // 1. Adiciona na pasta atual
        var result = addOrUpdatePermission(folder, targetUser, managerUser, dto.permissionType());

        /*
         * // 2. Propaga para CIMA (pastas pai) usando query recursiva
         * List<Folder> parentFolders =
         * folderRepository.findAllParentFoldersRecursive(folder.getFolderId());
         * for (Folder parentFolder : parentFolders) {
         * addOrUpdatePermission(parentFolder, targetUser, managerUser,
         * dto.permissionType());
         * }
         */

        // 3. Propaga para BAIXO (subpastas) usando query recursiva
        List<Folder> childFolders = folderRepository.findAllChildFoldersRecursive(folder.getFolderId());
        for (Folder childFolder : childFolders) {
            addOrUpdatePermission(childFolder, targetUser, managerUser, dto.permissionType());
        }

        return result;
    }

    @Transactional
    public void revokePermission(UUID permissionId, JwtAuthenticationToken token) {
        User managerUser = getUser(token);
        validateManagerUser(managerUser);

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NotFoundException("Permission not found"));

        if (!permission.getGrantedBy().getUserId().equals(managerUser.getUserId())) {
            throw new ForbiddenException("You are not authorized to revoke this permission.");
        }

        removePermission(permission.getFolder(), permission.getUser().getUserId());

        /*
         * // 2. Remove das pastas pai
         * List<Folder> parentFolders = folderRepository
         * .findAllParentFoldersRecursive(permission.getFolder().getFolderId());
         * for (Folder parentFolder : parentFolders) {
         * removePermission(parentFolder, permission.getUser().getUserId());
         * }
         */

        // 3. Remove das subpastas
        List<Folder> childFolders = folderRepository
                .findAllChildFoldersRecursive(permission.getFolder().getFolderId());
        for (Folder childFolder : childFolders) {
            removePermission(childFolder, permission.getUser().getUserId());
        }

        permissionRepository.delete(permission);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponseDTO> listPermissions(UUID targetUserId, JwtAuthenticationToken token) {
        User currentUser = getUser(token);
        List<Permission> permissions;
        Specification<Permission> spec;

        if (currentUser.getRole().getName().equals(Role.Values.admin)) {
            if (targetUserId != null) {
                // Admin seeking permissions for a specific user.
                spec = PermissionSpecifications.withEagerLoading()
                        .and(PermissionSpecifications.byUserId(targetUserId));

                permissions = permissionRepository.findAll(spec);
            } else {
                // Admin seeking all permissions
                spec = PermissionSpecifications.withEagerLoading();

                permissions = permissionRepository.findAll(spec);
            }
        } else if (currentUser.getRole().getName().equals(Role.Values.manager)) {
            // Managers can only list permissions they granted or for basic users in their
            // town
            if (targetUserId != null) {
                User targetUser = userRepository.findById(targetUserId)
                        .orElseThrow(() -> new NotFoundException("Target user not found"));
                validateBasicUser(targetUser);
                validateSameTown(currentUser, targetUser);

                // Manager searching for permissions for a specific user.
                spec = PermissionSpecifications.withEagerLoading()
                        .and(PermissionSpecifications.byUserId(targetUserId));

                permissions = permissionRepository.findAll(spec);
            } else {
                // List all permissions granted by this manager
                spec = PermissionSpecifications.withEagerLoading()
                        .and(PermissionSpecifications.byGrantedByUserId(currentUser.getUserId()));

                permissions = permissionRepository.findAll(spec);
            }
        } else {
            // Basic users can only list their own permissions
            if (targetUserId != null && !targetUserId.equals(currentUser.getUserId())) {
                throw new ForbiddenException("Basic users can only view their own permissions.");
            }

            // Basic user seeking their own permissions.
            spec = PermissionSpecifications.withEagerLoading()
                    .and(PermissionSpecifications.byUserId(currentUser.getUserId()));

            permissions = permissionRepository.findAll(spec);
        }

        return permissions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // Helper method to check if a user has a specific permission on a file/folder
    @Transactional(readOnly = true)
    public boolean checkPermission(UUID folderId, PermissionType type,
            JwtAuthenticationToken token) {
        User user = getUser(token);

        // Admins have all permissions.
        if (user.getRole().getName().equals(Role.Values.admin)) {
            return true;
        }

        // Managers have full permissions within their town.
        if (user.getRole().getName().equals(Role.Values.manager)) {
            // Check if it's in the same town.
            Folder folder = folderRepository.findById(folderId)
                    .orElse(null);
            if (folder != null && folder.getTown().getTownId().equals(user.getTown().getTownId())) {
                return true;
            }
        }

        // For basic users, check explicit permissions with hierarchy.
        return permissionsCheckService.hasPermissionOptimized(
                user.getUserId(), folderId, type, true);
    }

    // ==================== MÉTODOS AUXILIARES ====================

    private PermissionResponseDTO addOrUpdatePermission(Folder folder, User user, User grantedBy,
            PermissionType permissionType) {
        Optional<Permission> existingPermission = folder.getPermissions().stream()
                .filter(p -> p.getUser().getUserId().equals(user.getUserId()))
                .findFirst();

        Permission newPermission = new Permission();

        if (existingPermission.isPresent()) {
            existingPermission.get().setPermissionType(permissionType);
            return new PermissionResponseDTO(
                    existingPermission.get().getPermissionId(),
                    user.getUserId(),
                    user.getUsername(),
                    folder != null ? folder.getFolderId() : null,
                    folder.getName(),
                    existingPermission.get().getPermissionType(),
                    grantedBy.getUserId(),
                    grantedBy.getUsername(),
                    existingPermission.get().getCreatedAt());
        } else {
            newPermission.setFolder(folder);
            newPermission.setUser(user);
            newPermission.setGrantedBy(grantedBy);
            newPermission.setPermissionType(permissionType);
            folder.getPermissions().add(newPermission);
        }

        folderRepository.save(folder);

        return new PermissionResponseDTO(
                newPermission.getPermissionId(),
                user.getUserId(),
                user.getUsername(),
                folder != null ? folder.getFolderId() : null,
                folder.getName(),
                newPermission.getPermissionType(),
                grantedBy.getUserId(),
                grantedBy.getUsername(),
                newPermission.getCreatedAt());
    }

    private void removePermission(Folder folder, UUID userId) {
        folder.getPermissions().removeIf(p -> p.getUser().getUserId().equals(userId));
        folderRepository.save(folder);
    }

    private User getUser(JwtAuthenticationToken token) {
        return userRepository.findById(UUID.fromString(token.getName()))
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private void validateManagerUser(User user) {
        if (!user.getRole().getName().equals(Role.Values.manager)) {
            throw new ForbiddenException("Only manager users can grant or revoke permissions.");
        }
    }

    private void validateBasicUser(User user) {
        if (!user.getRole().getName().equals(Role.Values.basic)) {
            throw new BadRequestException("Permissions can only be granted to basic users.");
        }
    }

    private void validateSameTown(User manager, User target) {
        if (!manager.getTown().getTownId().equals(target.getTown().getTownId())) {
            throw new ForbiddenException("Manager can only grant permissions to users within their own town.");
        }
    }

    private PermissionResponseDTO mapToResponseDTO(Permission permission) {
        return new PermissionResponseDTO(
                permission.getPermissionId(),
                permission.getUser().getUserId(),
                permission.getUser().getUsername(),
                permission.getFolder() != null ? permission.getFolder().getFolderId() : null,
                permission.getFolder() != null ? permission.getFolder().getName() : null,
                permission.getPermissionType(),
                permission.getGrantedBy().getUserId(),
                permission.getGrantedBy().getUsername(),
                permission.getCreatedAt());
    }
}
