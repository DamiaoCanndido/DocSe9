package com.nergal.docseq.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.controllers.dto.TownshipRequestDTO;
import com.nergal.docseq.entities.Township;
import com.nergal.docseq.repositories.TownshipRepository;

@Service
public class TownshipService {

    private final TownshipRepository townshipRepo;
    
    public TownshipService(TownshipRepository townshipRepo) {
        this.townshipRepo = townshipRepo;
    }

    @Transactional
    public void createTownship(TownshipRequestDTO dto){
        var township = new Township();
        township.setName(dto.name());
        township.setUf(dto.uf());
        township.setImageUrl(dto.imageUrl());
        townshipRepo.save(township);
    }
}
