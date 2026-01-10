package com.nergal.docseq.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.FolderPermission;
import com.nergal.docseq.entities.FolderPermission.FolderPermissionType;

@Repository
public interface FolderPermissionRepository extends JpaRepository<FolderPermission, UUID> {

    Optional<FolderPermission> findByUserUserIdAndFolderFolderId(
            UUID userId,
            UUID folderId
    );

    boolean existsByUserUserIdAndFolderFolderIdAndPermission(
            UUID userId,
            UUID folderId,
            FolderPermissionType permission
    );

    void deleteByUserUserIdAndFolderFolderId(
            UUID userId,
            UUID folderId
    );

    void deleteByUserUserIdAndFolderFolderIdAndPermission(
        UUID userId,
        UUID folderId,
        FolderPermissionType permission
    );
}
