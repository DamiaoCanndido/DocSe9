package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Folder;

@Repository
public interface FolderRepository extends JpaRepository<Folder, UUID> {

    // Search for root folders (initial explorer)
    List<Folder> findByTownshipTownshipIdAndParentIsNullAndDeletedAtIsNull(
        UUID townshipId
    );

    // Search for subfolders within a folder
    List<Folder> findByParentFolderIdAndDeletedAtIsNull(
        UUID parentId
    );

    // Search ALL folders in the organization (full tree)
    List<Folder> findByTownshipTownshipIdAndDeletedAtIsNull(
        UUID townshipId
    );

    // Find favorite folders
    List<Folder> findByTownshipTownshipIdAndFavoriteTrueAndDeletedAtIsNull(
        UUID townshipId
    );

    // Recycle Bin – List deleted folders
    List<Folder> findByTownshipTownshipIdAndDeletedAtIsNotNull(
        UUID townshipId
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
}
