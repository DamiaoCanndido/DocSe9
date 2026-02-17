package com.nergal.docseq.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.TownV2;

@Repository
public interface TownV2Repository extends JpaRepository<TownV2, UUID> {

    Optional<TownV2> findByName(String name);

    Optional<TownV2> findByTownId(UUID townId);

}
