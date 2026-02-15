package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.PermissionType;

@Repository
public interface FileRepository extends JpaRepository<File, UUID>, JpaSpecificationExecutor<File> {

        // Search for files securely
        Optional<File> findByFileIdAndTownTownIdAndDeletedAtIsNull(
                        UUID fileId,
                        UUID townId);

        // Recycle Bin – Deleted Files
        Page<File> findByTownTownIdAndDeletedAtIsNotNull(
                        UUID townId,
                        Pageable page);

        // Search for files soft deleted
        Optional<File> findByFileIdAndTownTownIdAndDeletedAtIsNotNull(
                        UUID fileId,
                        UUID townId);

        @Query("""
                        SELECT DISTINCT f FROM File f
                        LEFT JOIN f.folder folder
                        LEFT JOIN folder.permissions p
                        LEFT JOIN p.user u
                        WHERE f.town.townId = :townId
                        AND f.deletedAt IS NOT NULL
                        AND f.folder.deletedAt IS NULL
                        AND (
                            :userRole IN ('manager')
                            OR (
                                u.userId = :userId
                                AND p.permissionType IN :acceptablePermissions
                            )
                        )
                        """)
        Page<File> findTrashByTownAndPermissions(
                        @Param("townId") UUID townId,
                        @Param("userId") UUID userId,
                        @Param("userRole") String userRole,
                        @Param("acceptablePermissions") List<PermissionType> acceptablePermissions,
                        Pageable pageable);

        List<File> findByFolderInAndDeletedAtIsNull(List<Folder> folders);

        List<File> findByFolderIn(List<Folder> folders);

        List<File> findByFolderInAndDeletedAtIsNotNull(List<Folder> folders);
}
