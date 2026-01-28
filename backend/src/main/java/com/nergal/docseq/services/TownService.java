package com.nergal.docseq.services;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.dto.towns.TownContentResponse;
import com.nergal.docseq.dto.towns.TownItemDTO;
import com.nergal.docseq.dto.towns.TownRequestDTO;
import com.nergal.docseq.dto.towns.TownUpdateDTO;
import com.nergal.docseq.entities.Town;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.helpers.mappers.PageMapper;
import com.nergal.docseq.repositories.TownRepository;

@Service
public class TownService {

    private final TownRepository townRepo;

    public TownService(TownRepository townRepo) {
        this.townRepo = townRepo;
    }

    @Transactional(readOnly = true)
    public TownContentResponse getAllTowns(Pageable pageable) {

        var townPage = townRepo.findAll(pageable);

        var townItems = townPage
                .map(town -> new TownItemDTO(
                        town.getTownId(),
                        town.getName(),
                        town.getUf(),
                        town.getImageUrl()));

        return new TownContentResponse(
                PageMapper.toPageResponse(townItems));
    }

    @Transactional
    public void createTown(TownRequestDTO dto) {
        var town = new Town();
        town.setName(dto.name());
        town.setUf(dto.uf().toUpperCase());
        town.setImageUrl(dto.imageUrl());
        townRepo.save(town);
    }

    protected void applyUpdates(TownUpdateDTO dto, Town town) {
        if (dto.name() != null) {
            town.setName(dto.name());
        }
        if (dto.uf() != null) {
            town.setUf(dto.uf().toUpperCase());
        }
        if (dto.imageUrl() != null) {
            town.setImageUrl(dto.imageUrl());
        }
    }

    @Transactional
    public void updateTown(UUID townId, TownUpdateDTO dto) {
        var town = townRepo.findById(townId)
                .orElseThrow(() -> new NotFoundException("Town not found"));

        applyUpdates(dto, town);
        townRepo.save(town);
    }

    @Transactional
    public void deleteTown(UUID townId) {
        townRepo.findById(townId)
                .orElseThrow(() -> new NotFoundException(
                        "Town not found"));
        townRepo.deleteById(townId);
    }
}
