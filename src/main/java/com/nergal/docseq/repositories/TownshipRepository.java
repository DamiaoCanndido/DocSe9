package com.nergal.docseq.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Township;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface TownshipRepository extends JpaRepository<Township, UUID>{

    Optional<Township> findByName(String name);

    Optional<Township> findByTownshipId(UUID townshipId);

}

