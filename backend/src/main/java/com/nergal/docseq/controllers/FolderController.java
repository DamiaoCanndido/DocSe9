package com.nergal.docseq.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
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

import com.nergal.docseq.dto.folders.FolderContentResponse;
import com.nergal.docseq.dto.folders.FolderRequestDTO;
import com.nergal.docseq.dto.folders.FolderTreeResponseDTO;
import com.nergal.docseq.dto.folders.FolderUpdateDTO;
import com.nergal.docseq.services.FolderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    /**
     * Create folder
     */
    @PostMapping
    public ResponseEntity<Void> create(
            @Valid @RequestBody FolderRequestDTO dto,
            JwtAuthenticationToken token) {
        folderService.create(dto, token);
        return ResponseEntity.ok().build();
    }

    /**
     * Update folder (name, favorite, parent folder)
     */
    @PatchMapping("/{folderId}")
    public ResponseEntity<Void> update(
            @PathVariable UUID folderId,
            @Valid @RequestBody FolderUpdateDTO dto,
            JwtAuthenticationToken token) {
        folderService.update(folderId, dto, token);
        return ResponseEntity.ok().build();
    }

    /**
     * List root folders (not deleted)
     */
    @GetMapping("/root")
    public ResponseEntity<FolderContentResponse> listRoot(
            Pageable pageable,
            @RequestParam(required = false) String name,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(folderService.listRootFolders(pageable, name, token));
    }

    /**
     * List subfolders of a folder
     */
    @GetMapping("/{folderId}/children")
    public ResponseEntity<FolderContentResponse> listChildren(
            @PathVariable UUID folderId,
            @RequestParam(required = false) String name,
            Pageable pageable,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(folderService.listChildren(folderId, name, pageable, token));
    }

    /**
     * Complete folder tree
     */
    @GetMapping("/tree")
    public ResponseEntity<List<FolderTreeResponseDTO>> tree(
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(folderService.getFolderTree(token));
    }

    /**
     * Favorite/unfavorite folder
     */
    @PatchMapping("/{folderId}/favorite")
    public ResponseEntity<Void> toggleFavorite(
            @PathVariable UUID folderId,
            JwtAuthenticationToken token) {
        folderService.toggleFavorite(folderId, token);
        return ResponseEntity.noContent().build();
    }

    /**
     * Move folder (change parent)
     */
    @PatchMapping("/{folderId}/move/{targetFolderId}")
    public ResponseEntity<Void> move(
            @PathVariable UUID folderId,
            @PathVariable UUID targetFolderId,
            JwtAuthenticationToken token) {
        folderService.move(folderId, targetFolderId, token);
        return ResponseEntity.noContent().build();
    }

    /**
     * Soft delete (goes to the trash, recursive)
     */
    @DeleteMapping("/{folderId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID folderId,
            JwtAuthenticationToken token) {
        folderService.softDelete(folderId, token);
        return ResponseEntity.noContent().build();
    }

    /**
     * List folders in the trash.
     */
    @GetMapping("/trash")
    public ResponseEntity<FolderContentResponse> listTrash(
            Pageable pageable,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(folderService.listTrash(pageable, token));
    }

    /**
     * Restore folder from trash (recursive)
     * !!!OBS: Folders that belong to other folders do not appear in the hierarchy.
     */
    @PatchMapping("/{folderId}/restore")
    public ResponseEntity<Void> restore(
            @PathVariable UUID folderId,
            JwtAuthenticationToken token) {
        folderService.restore(folderId, token);
        return ResponseEntity.noContent().build();
    }

    /**
     * Permanent exclusion
     */
    @DeleteMapping("/{folderId}/permanent")
    public ResponseEntity<Void> permanentDelete(
            @PathVariable UUID folderId,
            JwtAuthenticationToken token) {
        folderService.permanentDelete(folderId, token);
        return ResponseEntity.noContent().build();
    }
}
