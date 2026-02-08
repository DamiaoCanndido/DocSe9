package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Folder;

@Repository
public interface FolderRepository extends
                JpaRepository<Folder, UUID>,
                JpaSpecificationExecutor<Folder> {

        // Search ALL folders in the organization (full tree)
        List<Folder> findByTownTownIdAndDeletedAtIsNull(
                        UUID townId);

        // Recycle Bin – List deleted folders
        Page<Folder> findByTownTownIdAndDeletedAtIsNotNull(
                        UUID townId,
                        Pageable page);

        // Check for duplicate names in the same folder
        boolean existsByNameAndParentAndDeletedAtIsNull(
                        String name,
                        Folder parent);

        // Search for specific folder
        Optional<Folder> findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                        UUID folderId,
                        UUID townId);

        // Search for "restore" in the trash can.
        Optional<Folder> findByFolderIdAndTownTownIdAndDeletedAtIsNotNull(
                        UUID folderId,
                        UUID towshipId);

        List<Folder> findByTownTownId(UUID townId);
}
