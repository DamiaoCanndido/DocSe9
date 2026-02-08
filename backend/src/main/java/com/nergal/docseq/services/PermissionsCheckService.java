package com.nergal.docseq.services;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.repositories.PermissionRepository;

@Service
public class PermissionsCheckService {

    private final PermissionRepository permissionRepository;

    public PermissionsCheckService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    /**
     * Versão otimizada que funciona para Folder ou File.
     * 
     * @param userId   ID do usuário
     * @param entityId ID da pasta ou arquivo
     * @param required Permissão requerida
     * @param isFolder true para Folder, false para File
     * @return true se tem permissão (considerando hierarquia)
     */
    public boolean hasPermissionOptimized(UUID userId, UUID entityId,
            PermissionType required, boolean isFolder) {
        // Busca todas as permissões que implicam na permissão requerida
        List<PermissionType> acceptablePermissions = Arrays.stream(PermissionType.values())
                .filter(p -> p.implies(required))
                .collect(Collectors.toList());

        if (isFolder) {
            return permissionRepository.existsByUserIdAndFolderIdAndPermissionTypeIn(
                    userId, entityId, acceptablePermissions);
        } else {
            return permissionRepository.existsByUserIdAndFileIdAndPermissionTypeIn(
                    userId, entityId, acceptablePermissions);
        }
    }

    // Métodos de conveniência para Folder
    public boolean hasPermission(User user, Folder folder, PermissionType required) {
        return folder.getPermissions().stream()
                .filter(p -> p.getUser().equals(user))
                .anyMatch(p -> p.getPermissionType().implies(required));
    }

    public boolean canRead(User user, Folder folder) {
        return hasPermission(user, folder, PermissionType.READ);
    }

    public boolean canWrite(User user, Folder folder) {
        return hasPermission(user, folder, PermissionType.WRITE);
    }

    public boolean canDelete(User user, Folder folder) {
        return hasPermission(user, folder, PermissionType.DELETE);
    }

    public boolean canShare(User user, Folder folder) {
        return hasPermission(user, folder, PermissionType.SHARE);
    }

    // Métodos de conveniência para File
    public boolean hasPermission(User user, File file, PermissionType required) {
        return file.getPermissions().stream()
                .filter(p -> p.getUser().equals(user))
                .anyMatch(p -> p.getPermissionType().implies(required));
    }

    public boolean canRead(User user, File file) {
        return hasPermission(user, file, PermissionType.READ);
    }

    public boolean canWrite(User user, File file) {
        return hasPermission(user, file, PermissionType.WRITE);
    }

    public boolean canDelete(User user, File file) {
        return hasPermission(user, file, PermissionType.DELETE);
    }

    public boolean canShare(User user, File file) {
        return hasPermission(user, file, PermissionType.SHARE);
    }
}
