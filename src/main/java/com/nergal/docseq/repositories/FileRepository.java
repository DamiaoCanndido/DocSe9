package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;

@Repository
public interface FileRepository extends JpaRepository<File, UUID> {

    // List files in a folder
    Page<File> findByFolderFolderIdAndDeletedAtIsNull(
        UUID folderId,
        Pageable page
    );

    // List files by folder id
    List<File> findByFolderFolderId(UUID folderId);

    // List files than delete at not null
    List<File> findByFolderAndDeletedAtIsNotNull(Folder folder);

    // List files in the root directory.
    Page<File> findByFolderIsNullAndTownshipTownshipIdAndDeletedAtIsNull(
        UUID townshipId,
        Pageable page
    );

    // Search for favorite files
    Page<File> findByTownshipTownshipIdAndFavoriteTrueAndDeletedAtIsNull(
        UUID townshipId,
        Pageable page
    );

    // Recycle Bin – Deleted Files
    Page<File> findByTownshipTownshipIdAndDeletedAtIsNotNull(
        UUID townshipId,
        Pageable page
    );

    // Search for files securely
    Optional<File> findByFileIdAndTownshipTownshipIdAndDeletedAtIsNull(
        UUID fileId,
        UUID townshipId
    );

    // Check for duplicate names in the same folder
    boolean existsByNameAndFolderAndDeletedAtIsNull(
        String name,
        Folder folder
    );

    // Search for restore
    Optional<File> findByFileIdAndDeletedAtIsNotNull(UUID fileId);

    List<File> findByFolderAndDeletedAtIsNull(Folder folder);

    List<File> findByFolderFolderIdAndDeletedAtIsNotNull(UUID folderId);

    void deleteByFolderFolderId(UUID folderId);
}
