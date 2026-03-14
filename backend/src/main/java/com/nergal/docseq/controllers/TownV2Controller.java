package com.nergal.docseq.controllers;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.dto.towns.TownContentResponse;
import com.nergal.docseq.dto.towns.TownRequestDTO;
import com.nergal.docseq.dto.towns.TownUpdateDTO;
import com.nergal.docseq.services.TownV2Service;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/v2/town")
@PreAuthorize("hasAuthority('SCOPE_admin')")
public class TownV2Controller {

    private final TownV2Service townService;

    public TownV2Controller(TownV2Service townService) {
        this.townService = townService;
    }

    @GetMapping
    public ResponseEntity<TownContentResponse> getTowns(@RequestParam(required = false) String name,
            Pageable pageable) {
        return ResponseEntity.ok(townService.getAllTowns(name, pageable));
    }

    @PostMapping
    public ResponseEntity<Void> createTown(@Valid @RequestBody TownRequestDTO dto, JwtAuthenticationToken token) {
        townService.createTown(dto, token);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> updateTown(@PathVariable UUID id, @Valid @RequestBody TownUpdateDTO dto,
            JwtAuthenticationToken token) {
        townService.updateTown(id, dto, token);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTown(@PathVariable UUID id, JwtAuthenticationToken token) {
        townService.deleteTown(id, token);
        return ResponseEntity.ok().build();
    }
}
