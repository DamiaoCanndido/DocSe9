package com.nergal.docseq.controllers;

import com.nergal.docseq.dto.permissions.PermissionRequestDTO;
import com.nergal.docseq.dto.permissions.PermissionResponseDTO;
import com.nergal.docseq.services.PermissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_manager')")
    public ResponseEntity<PermissionResponseDTO> grantPermission(
            @Valid @RequestBody PermissionRequestDTO dto,
            JwtAuthenticationToken token) {
        PermissionResponseDTO response = permissionService.grantPermission(dto, token);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{permissionId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_manager', 'SCOPE_admin')")
    public ResponseEntity<Void> revokePermission(
            @PathVariable UUID permissionId,
            JwtAuthenticationToken token) {
        permissionService.revokePermission(permissionId, token);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SCOPE_admin', 'SCOPE_manager', 'SCOPE_basic')")
    public ResponseEntity<List<PermissionResponseDTO>> listPermissions(
            @RequestParam(required = false) UUID userId,
            JwtAuthenticationToken token) {
        List<PermissionResponseDTO> permissions = permissionService.listPermissions(userId, token);
        return ResponseEntity.ok(permissions);
    }
}
