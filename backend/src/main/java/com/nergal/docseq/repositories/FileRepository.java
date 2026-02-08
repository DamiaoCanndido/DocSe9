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

        List<File> findByFolderInAndDeletedAtIsNull(List<Folder> folders);

        List<File> findByFolderIn(List<Folder> folders);

        List<File> findByFolderInAndDeletedAtIsNotNull(List<Folder> folders);
}
