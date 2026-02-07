package com.nergal.docseq.repositories;

import com.nergal.docseq.entities.Permission;
import com.nergal.docseq.entities.PermissionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByUserUserIdAndFolderFolderIdAndPermissionTypeAndFileIsNull(
            UUID userId, UUID folderId, PermissionType permissionType);

    Optional<Permission> findByUserUserIdAndFileFileIdAndPermissionTypeAndFolderIsNull(
            UUID userId, UUID fileId, PermissionType permissionType);

    List<Permission> findByFolderFolderId(UUID folderId);

    List<Permission> findByFileFileId(UUID fileId);

    void deleteByUserUserIdAndFolderFolderIdAndPermissionTypeAndFileIsNull(
            UUID userId, UUID folderId, PermissionType permissionType);

    void deleteByUserUserIdAndFileFileIdAndPermissionTypeAndFolderIsNull(
            UUID userId, UUID fileId, PermissionType permissionType);

    List<Permission> findByUserUserId(UUID userId);

    List<Permission> findByGrantedByUserId(UUID grantedByUserId);
}
