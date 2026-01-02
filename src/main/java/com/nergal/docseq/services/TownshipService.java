package com.nergal.docseq.services;

import org.springframework.data.domain.Sort;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.controllers.dto.TownshipDTO;
import com.nergal.docseq.controllers.dto.TownshipItemDTO;
import com.nergal.docseq.controllers.dto.TownshipRequestDTO;
import com.nergal.docseq.entities.Township;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.repositories.TownshipRepository;

@Service
public class TownshipService {

    private final TownshipRepository townshipRepo;
    
    public TownshipService(TownshipRepository townshipRepo) {
        this.townshipRepo = townshipRepo;
    }

    @Transactional(readOnly = true)
    public TownshipDTO getAllTownships(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.Direction.ASC, "name");
        var townshipPage = townshipRepo.findAll(pageable);

        var townshipItems = townshipPage.getContent().stream()
            .map(township -> new TownshipItemDTO(
                township.getTownshipId(),
                township.getName(),
                township.getUf(),
                township.getImageUrl()
            ))
            .toList();
        
        return new TownshipDTO(
            townshipItems,
            townshipPage.getNumber(),
            townshipPage.getSize(),
            townshipPage.getTotalPages(),
            townshipPage.getTotalElements()
        );
    }

    @Transactional
    public void createTownship(TownshipRequestDTO dto){
        var township = new Township();
        township.setName(dto.name());
        township.setUf(dto.uf());
        township.setImageUrl(dto.imageUrl());
        townshipRepo.save(township);
    }

    @Transactional
    public void deleteTownship(UUID townshipId){
        townshipRepo.findById(townshipId)
        .orElseThrow(() -> new NotFoundException(
            "Township not found"
        ));
        townshipRepo.deleteById(townshipId);
    }
}
