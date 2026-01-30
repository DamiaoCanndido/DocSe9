package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;

@Repository
public interface FileRepository extends JpaRepository<File, UUID>, JpaSpecificationExecutor<File> {

        // List files in a folder
        Page<File> findByFolderFolderIdAndDeletedAtIsNull(
                        UUID folderId,
                        Pageable page);

        // List files by folder id
        List<File> findByFolderFolderId(UUID folderId);

        // List files than delete at not null
        List<File> findByFolderAndDeletedAtIsNotNull(Folder folder);

        // List files in the root directory.
        Page<File> findByFolderIsNullAndTownTownIdAndDeletedAtIsNull(
                        UUID townId,
                        Pageable page);

        // Search for favorite files
        Page<File> findByTownTownIdAndFavoriteTrueAndDeletedAtIsNull(
                        UUID townId,
                        Pageable page);

        // Recycle Bin – Deleted Files
        Page<File> findByTownTownIdAndDeletedAtIsNotNull(
                        UUID townId,
                        Pageable page);

        // Search for files securely
        Optional<File> findByFileIdAndTownTownIdAndDeletedAtIsNull(
                        UUID fileId,
                        UUID townId);

        // Search for files soft deleted
        Optional<File> findByFileIdAndTownTownIdAndDeletedAtIsNotNull(
                        UUID fileId,
                        UUID townId);

        // Search for folder id and town id
        Optional<File> findByFolderFolderIdAndTownTownIdAndDeletedAtIsNull(
                        UUID folderId,
                        UUID townId);

        // Check for duplicate names in the same folder
        boolean existsByNameAndFolderAndDeletedAtIsNull(
                        String name,
                        Folder folder);

        // Search for restore
        Optional<File> findByFileIdAndDeletedAtIsNotNull(UUID fileId);

        List<File> findByFolderAndDeletedAtIsNull(Folder folder);

        List<File> findByFolderFolderIdAndDeletedAtIsNotNull(UUID folderId);

        void deleteByFolderFolderId(UUID folderId);

        /*
         * @Modifying
         * 
         * @Transactional
         * 
         * @Query("UPDATE Folder f SET f.deletedAt = null, f.deletedBy = null WHERE f.folderId IN :folderIds"
         * )
         * void restoreFoldersByIds(@Param("folderIds") List<UUID> folderIds);
         */
}
