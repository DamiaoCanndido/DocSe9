package com.nergal.docseq.repositories;

import com.nergal.docseq.entities.Permission;
import com.nergal.docseq.entities.PermissionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID>, JpaSpecificationExecutor<Permission> {

        // Para Folders
        @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
                        "FROM Permission p " +
                        "WHERE p.user.userId = :userId " +
                        "AND p.folder.folderId = :folderId " +
                        "AND p.permissionType IN :types " +
                        "AND p.file IS NULL") // Garante que é permissão de folder
        boolean existsByUserIdAndFolderIdAndPermissionTypeIn(
                        @Param("userId") UUID userId,
                        @Param("folderId") UUID folderId,
                        @Param("types") List<PermissionType> types);

        // Para Files
        @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
                        "FROM Permission p " +
                        "WHERE p.user.userId = :userId " +
                        "AND p.file.fileId = :fileId " +
                        "AND p.permissionType IN :types " +
                        "AND p.folder IS NULL") // Garante que é permissão de file
        boolean existsByUserIdAndFileIdAndPermissionTypeIn(
                        @Param("userId") UUID userId,
                        @Param("fileId") UUID fileId,
                        @Param("types") List<PermissionType> types);

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
