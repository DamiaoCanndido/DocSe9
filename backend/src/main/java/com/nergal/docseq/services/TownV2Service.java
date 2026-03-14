package com.nergal.docseq.services;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.dto.towns.TownContentResponse;
import com.nergal.docseq.dto.towns.TownItemDTO;
import com.nergal.docseq.dto.towns.TownRequestDTO;
import com.nergal.docseq.dto.towns.TownUpdateDTO;
import com.nergal.docseq.entities.TownV2;
import com.nergal.docseq.entities.UserV2;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.helpers.mappers.PageMapper;
import com.nergal.docseq.helpers.specifications.TownSpecifications;
import com.nergal.docseq.repositories.TownV2Repository;
import com.nergal.docseq.repositories.UserV2Repository;

@Service
public class TownV2Service {

    private final TownV2Repository townRepo;
    private final UserV2Repository userRepository;
    private final AuditLogService auditLogService;

    public TownV2Service(TownV2Repository townRepo, UserV2Repository userRepository,
            AuditLogService auditLogService) {
        this.townRepo = townRepo;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public TownContentResponse getAllTowns(String name, Pageable pageable) {

        var townPage = townRepo.findAll(TownSpecifications.withFilters(name), pageable);

        var townItems = townPage
                .map(town -> new TownItemDTO(
                        town.getTownId(),
                        town.getName(),
                        town.getUf(),
                        town.getImageUrl(),
                        town.getUsers().size()));

        return new TownContentResponse(
                PageMapper.toPageResponse(townItems));
    }

    @Transactional
    public void createTown(TownRequestDTO dto, JwtAuthenticationToken token) {
        var user = getUser(token);
        var town = new TownV2();
        town.setName(dto.name());
        town.setUf(dto.uf().toUpperCase());
        town.setImageUrl(dto.imageUrl());
        townRepo.save(town);

        auditLogService.saveLog(user, "CREATE_TOWN", "TOWN", town.getTownId(), "Town created: " + town.getName(),
                null);
    }

    protected void applyUpdates(TownUpdateDTO dto, TownV2 town) {
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
    public void updateTown(UUID townId, TownUpdateDTO dto, JwtAuthenticationToken token) {
        var user = getUser(token);
        var town = townRepo.findById(townId)
                .orElseThrow(() -> new NotFoundException("Town not found"));

        applyUpdates(dto, town);
        townRepo.save(town);

        auditLogService.saveLog(user, "UPDATE_TOWN", "TOWN", townId, "Town updated: " + town.getName(), null);
    }

    @Transactional
    public void deleteTown(UUID townId, JwtAuthenticationToken token) {
        var user = getUser(token);
        var town = townRepo.findById(townId)
                .orElseThrow(() -> new NotFoundException(
                        "Town not found"));
        townRepo.deleteById(townId);

        auditLogService.saveLog(user, "DELETE_TOWN", "TOWN", townId, "Town deleted: " + town.getName(), null);
    }

    private UserV2 getUser(JwtAuthenticationToken token) {
        return userRepository.findById(UUID.fromString(token.getName()))
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
