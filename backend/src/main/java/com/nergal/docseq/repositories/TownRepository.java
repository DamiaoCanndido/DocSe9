package com.nergal.docseq.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Town;

@Repository
public interface TownRepository extends JpaRepository<Town, UUID> {

    Optional<Town> findByName(String name);

    Optional<Town> findByTownId(UUID townId);

}
