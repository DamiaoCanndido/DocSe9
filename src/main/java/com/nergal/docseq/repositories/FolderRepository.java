package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Folder;

@Repository
public interface FolderRepository extends JpaRepository<Folder, UUID> {

    // Search for root folders (initial explorer)
    Page<Folder> findByTownshipTownshipIdAndParentIsNullAndDeletedAtIsNull(
        UUID townshipId,
        Pageable page
    );

    // Search for subfolders within a folder
    Page<Folder> findByParentFolderIdAndDeletedAtIsNull(
        UUID parentId,
        Pageable page
    );

    // Search ALL folders in the organization (full tree)
    List<Folder> findByTownshipTownshipIdAndDeletedAtIsNull(
        UUID townshipId
    );

    // Find favorite folders
    Page<Folder> findByTownshipTownshipIdAndFavoriteTrueAndDeletedAtIsNull(
        UUID townshipId,
        Pageable page
    );

    // Recycle Bin – List deleted folders
    Page<Folder> findByTownshipTownshipIdAndDeletedAtIsNotNull(
        UUID townshipId,
        Pageable page
    );

    // Check for duplicate names in the same folder
    boolean existsByNameAndParentAndDeletedAtIsNull(
        String name,
        Folder parent
    );

    // Search for specific folder
    Optional<Folder> findByFolderIdAndTownshipTownshipIdAndDeletedAtIsNull(
        UUID folderId,
        UUID townshipId
    );
    
    // Search for "restore" in the trash can.
    Optional<Folder> findByFolderIdAndDeletedAtIsNotNull(
        UUID folderId
    );

    List<Folder> findByParentAndDeletedAtIsNull(Folder parent);

    Optional<Folder> findByFolderIdAndDeletedAtIsNull(UUID folderId);

    List<Folder> findByParentFolderId(UUID parentId);
}
