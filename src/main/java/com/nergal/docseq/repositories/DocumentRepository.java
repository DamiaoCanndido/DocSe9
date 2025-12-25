package com.nergal.docseq.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.nergal.docseq.entities.Document;

@NoRepositoryBean
public interface DocumentRepository<T extends Document>
        extends JpaRepository<T, UUID> {

    List<T> findByTownshipTownshipId(UUID townshipId);
}

