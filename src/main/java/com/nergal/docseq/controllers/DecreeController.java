package com.nergal.docseq.controllers;


import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.controllers.dto.DocumentRequestDTO;
import com.nergal.docseq.controllers.dto.UpdateDocumentDTO;
import com.nergal.docseq.services.DecreeService;
import jakarta.validation.Valid;


@RequestMapping("/decrees")
@RestController
public class DecreeController {

    private final DecreeService decreeService;

    public DecreeController(DecreeService decreeService) {
        this.decreeService = decreeService;
    }

    @PreAuthorize("hasAuthority('SCOPE_DECREE_CREATE')")
    @PostMapping("")
    public ResponseEntity<Void> createDecree(@Valid @RequestBody DocumentRequestDTO dto, JwtAuthenticationToken token) {
        decreeService.createDecree(dto, token);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_DECREE_UPDATE')")
    public ResponseEntity<Void> update(
            @PathVariable UUID id,
            @RequestBody UpdateDocumentDTO dto
    ) {
        decreeService.update(id, dto);
        return ResponseEntity.ok().build();
    }
}

