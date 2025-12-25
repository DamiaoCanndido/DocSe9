package com.nergal.docseq.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.controllers.dto.TownshipRequestDTO;
import com.nergal.docseq.services.TownshipService;

@RestController
public class TownshipController {

    private final TownshipService townshipService;

    public TownshipController(TownshipService townshipService) {
        this.townshipService = townshipService;
    }

    @PostMapping("/town")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<Void> createTown(@RequestBody TownshipRequestDTO dto) {
        townshipService.createTownship(dto);
        return ResponseEntity.ok().build();
    }
}
