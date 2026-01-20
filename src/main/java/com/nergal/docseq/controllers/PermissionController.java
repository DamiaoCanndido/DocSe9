package com.nergal.docseq.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.dto.permissions.PermissionDTO;
import com.nergal.docseq.dto.permissions.PermissionRequestDTO;
import com.nergal.docseq.entities.PermissionEnum;
import com.nergal.docseq.services.PermissionService;

import jakarta.validation.Valid;

@RestController
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/users/{userId}/permissions")
    public ResponseEntity<PermissionDTO> list(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
            permissionService.getPermissionsByUserId(page, size, userId)
        );
    }


    @PostMapping("/permissions")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<Void> createPermission(@Valid @RequestBody PermissionRequestDTO dto) {
        permissionService.createPermission(dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}/permissions")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<Void> deletePermission(
            @PathVariable UUID userId,
            @RequestParam PermissionEnum name
    ) {
        permissionService.deletePermission(userId, name);
        return ResponseEntity.ok().build();
    }
}