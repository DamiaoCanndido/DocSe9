package com.nergal.docseq.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.controllers.dto.PermissionRequestDTO;
import com.nergal.docseq.services.PermissionService;

@RestController
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping("/permissions")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<Void> createPermission(@RequestBody PermissionRequestDTO dto, JwtAuthenticationToken token) {
        permissionService.createPermission(dto, token);
        return ResponseEntity.ok().build();
    }
}
