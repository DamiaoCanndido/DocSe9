package com.nergal.docseq.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.controllers.dto.TownshipDTO;
import com.nergal.docseq.controllers.dto.TownshipRequestDTO;
import com.nergal.docseq.services.TownshipService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/town")
public class TownshipController {

    private final TownshipService townshipService;

    public TownshipController(TownshipService townshipService) {
        this.townshipService = townshipService;
    }

    @GetMapping("")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<TownshipDTO> getTownships(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(townshipService.getAllTownships(page, pageSize));
    }
    

    @PostMapping("")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<Void> createTown(@RequestBody TownshipRequestDTO dto) {
        townshipService.createTownship(dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<Void> deleteTown(@PathVariable UUID id) {
        townshipService.deleteTownship(id);
        return ResponseEntity.ok().build();
    }
}
