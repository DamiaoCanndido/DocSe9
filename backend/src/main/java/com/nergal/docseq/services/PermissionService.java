package com.nergal.docseq.services;

import com.nergal.docseq.dto.permissions.PermissionRequestDTO;
import com.nergal.docseq.dto.permissions.PermissionResponseDTO;
import com.nergal.docseq.entities.*;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.repositories.*;
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
    private final FileRepository fileRepository;

    public PermissionService(PermissionRepository permissionRepository,
                             UserRepository userRepository,
                             FolderRepository folderRepository,
                             FileRepository fileRepository) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.folderRepository = folderRepository;
        this.fileRepository = fileRepository;
    }

    @Transactional
    public PermissionResponseDTO grantPermission(PermissionRequestDTO dto, JwtAuthenticationToken token) {
        User managerUser = getUser(token);
        validateManagerUser(managerUser);

        User targetUser = userRepository.findById(dto.userId())
                .orElseThrow(() -> new NotFoundException("Target user not found"));
        validateBasicUser(targetUser);
        validateSameTown(managerUser, targetUser);

        Folder folder = null;
        File file = null;
        String folderName = null;
        String fileName = null;

        if (dto.folderId() != null) {
            folder = folderRepository.findByFolderIdAndTownTownIdAndDeletedAtIsNull(dto.folderId(), managerUser.getTown().getTownId())
                    .orElseThrow(() -> new NotFoundException("Folder not found or does not belong to your town"));
            folderName = folder.getName();
        } else if (dto.fileId() != null) {
            file = fileRepository.findByFileIdAndTownTownIdAndDeletedAtIsNull(dto.fileId(), managerUser.getTown().getTownId())
                    .orElseThrow(() -> new NotFoundException("File not found or does not belong to your town"));
            fileName = file.getName();
        } else {
            throw new BadRequestException("Either folderId or fileId must be provided.");
        }

        // Check for existing permission
        boolean permissionExists = false;
        if (folder != null) {
            permissionExists = permissionRepository.findByUserUserIdAndFolderFolderIdAndPermissionTypeAndFileIsNull(
                    targetUser.getUserId(), folder.getFolderId(), dto.permissionType()).isPresent();
        } else {
            permissionExists = permissionRepository.findByUserUserIdAndFileFileIdAndPermissionTypeAndFolderIsNull(
                    targetUser.getUserId(), file.getFileId(), dto.permissionType()).isPresent();
        }

        if (permissionExists) {
            throw new ConflictException("Permission already exists for this user and resource.");
        }

        Permission permission = new Permission();
        permission.setUser(targetUser);
        permission.setFolder(folder);
        permission.setFile(file);
        permission.setPermissionType(dto.permissionType());
        permission.setGrantedBy(managerUser);

        permissionRepository.save(permission);

        return new PermissionResponseDTO(
                permission.getPermissionId(),
                targetUser.getUserId(),
                targetUser.getUsername(),
                folder != null ? folder.getFolderId() : null,
                folderName,
                file != null ? file.getFileId() : null,
                fileName,
                permission.getPermissionType(),
                managerUser.getUserId(),
                managerUser.getUsername(),
                permission.getCreatedAt()
        );
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

        permissionRepository.delete(permission);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponseDTO> listPermissions(UUID targetUserId, JwtAuthenticationToken token) {
        User currentUser = getUser(token);
        List<Permission> permissions;

        if (currentUser.getRole().getName().equals(Role.Values.admin)) {
            if (targetUserId != null) {
                permissions = permissionRepository.findByUserUserId(targetUserId);
            } else {
                permissions = permissionRepository.findAll();
            }
        } else if (currentUser.getRole().getName().equals(Role.Values.manager)) {
            // Managers can only list permissions they granted or for basic users in their town
            if (targetUserId != null) {
                User targetUser = userRepository.findById(targetUserId)
                        .orElseThrow(() -> new NotFoundException("Target user not found"));
                validateBasicUser(targetUser);
                validateSameTown(currentUser, targetUser);
                permissions = permissionRepository.findByUserUserId(targetUserId);
            } else {
                // List all permissions granted by this manager
                permissions = permissionRepository.findByGrantedByUserId(currentUser.getUserId());
            }
        } else {
            // Basic users can only list their own permissions
            if (targetUserId != null && !targetUserId.equals(currentUser.getUserId())) {
                throw new ForbiddenException("Basic users can only view their own permissions.");
            }
            permissions = permissionRepository.findByUserUserId(currentUser.getUserId());
        }

        return permissions.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    // Helper method to check if a user has a specific permission on a file/folder
    @Transactional(readOnly = true)
    public boolean checkPermission(UUID targetEntityId, boolean isFolder, PermissionType type, JwtAuthenticationToken token) {
        User user = getUser(token);

        // Admins and managers implicitly have all permissions within their scope
        if (user.getRole().getName().equals(Role.Values.admin) || user.getRole().getName().equals(Role.Values.manager)) {
            return true;
        }

        // Check if basic user has explicit permission
        Optional<Permission> permission;
        if (isFolder) {
            permission = permissionRepository.findByUserUserIdAndFolderFolderIdAndPermissionTypeAndFileIsNull(
                    user.getUserId(), targetEntityId, type);
        } else {
            permission = permissionRepository.findByUserUserIdAndFileFileIdAndPermissionTypeAndFolderIsNull(
                    user.getUserId(), targetEntityId, type);
        }
        return permission.isPresent();
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
        String folderName = null;
        if (permission.getFolder() != null) {
            try {
                folderName = permission.getFolder().getName();
            } catch (Exception e) {
                // Handle lazy loading exception if getName is called outside a transaction
                // or if entity is detached. Fetching again for safety.
                folderRepository.findById(permission.getFolder().getFolderId()).ifPresent(f -> {
                    // This is not ideal as it might cause N+1. Better to use a DTO projection
                    // in the repository or fetch eagerly if always needed.
                });
            }
        }

        String fileName = null;
        if (permission.getFile() != null) {
            try {
                fileName = permission.getFile().getName();
            } catch (Exception e) {
                fileRepository.findById(permission.getFile().getFileId()).ifPresent(f -> {
                });
            }
        }

        return new PermissionResponseDTO(
                permission.getPermissionId(),
                permission.getUser().getUserId(),
                permission.getUser().getUsername(),
                permission.getFolder() != null ? permission.getFolder().getFolderId() : null,
                folderName,
                permission.getFile() != null ? permission.getFile().getFileId() : null,
                fileName,
                permission.getPermissionType(),
                permission.getGrantedBy().getUserId(),
                permission.getGrantedBy().getUsername(),
                permission.getCreatedAt()
        );
    }
}
