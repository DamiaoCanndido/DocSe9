package com.nergal.docseq.controllers;

import java.util.List;
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

import com.nergal.docseq.dto.nodes.NodeContentResponse;
import com.nergal.docseq.dto.nodes.NodeRequestDTO;
import com.nergal.docseq.dto.nodes.NodeTreeResponseDTO;
import com.nergal.docseq.dto.nodes.NodeUpdateDTO;
import com.nergal.docseq.dto.search.SearchV2ResponseDTO;
import com.nergal.docseq.services.NodeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/v2/folders")
@PreAuthorize("hasAnyAuthority('SCOPE_manager', 'SCOPE_basic')")
public class NodeController {

    private final NodeService nodeService;

    public NodeController(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    /**
     * Create folder
     */
    @PostMapping
    public ResponseEntity<Void> create(
            @Valid @RequestBody NodeRequestDTO dto,
            JwtAuthenticationToken token) {
        nodeService.create(dto, token);
        return ResponseEntity.ok().build();
    }

    /**
     * Update folder (name, favorite)
     */
    @PatchMapping("/{folderId}")
    public ResponseEntity<Void> update(
            @PathVariable UUID folderId,
            @Valid @RequestBody NodeUpdateDTO dto,
            JwtAuthenticationToken token) {
        nodeService.update(folderId, dto, token);
        return ResponseEntity.ok().build();
    }

    /**
     * List root folders (not deleted)
     */
    @GetMapping("/root")
    public ResponseEntity<NodeContentResponse> listRoot(
            Pageable pageable,
            @RequestParam(required = false) String name,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(nodeService.listRootNodes(pageable, name, token));
    }

    /**
     * List subfolders of a folder
     */
    @GetMapping("/{folderId}/children")
    public ResponseEntity<NodeContentResponse> listChildren(
            @PathVariable UUID folderId,
            @RequestParam(required = false) String name,
            Pageable pageable,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(nodeService.listChildren(folderId, name, pageable, token));
    }

    /**
     * Search for folders and files by name
     */
    @GetMapping("/search")
    public ResponseEntity<SearchV2ResponseDTO> search(
            @RequestParam(required = false) String name,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(nodeService.searchNodes(name, token));
    }

    /**
     * Complete folder tree
     */
    @GetMapping("/tree")
    public ResponseEntity<List<NodeTreeResponseDTO>> tree(
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(nodeService.getNodeTree(token));
    }

    /**
     * List favorite folders and files
     */
    @GetMapping("/favorites")
    public ResponseEntity<NodeContentResponse> listFavorites(
            Pageable pageable,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(nodeService.listFavorites(pageable, token));
    }

    /**
     * Favorite/unfavorite folder
     */
    @PatchMapping("/{folderId}/favorite")
    public ResponseEntity<Void> toggleFavorite(
            @PathVariable UUID folderId,
            JwtAuthenticationToken token) {
        nodeService.toggleFavorite(folderId, token);
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
        nodeService.move(folderId, targetFolderId, token);
        return ResponseEntity.noContent().build();
    }

    /**
     * Soft delete (goes to the trash, recursive)
     */
    @DeleteMapping("/{folderId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID folderId,
            JwtAuthenticationToken token) {
        nodeService.softDelete(folderId, token);
        return ResponseEntity.noContent().build();
    }

    /**
     * List folders in the trash.
     */
    @GetMapping("/trash")
    public ResponseEntity<NodeContentResponse> listTrash(
            Pageable pageable,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(nodeService.listTrash(pageable, token));
    }

    /**
     * Restore folder from trash (recursive)
     * !!!OBS: Folders that belong to other folders do not appear in the hierarchy.
     */
    @PatchMapping("/{folderId}/restore")
    public ResponseEntity<Void> restore(
            @PathVariable UUID folderId,
            JwtAuthenticationToken token) {
        nodeService.restore(folderId, token);
        return ResponseEntity.noContent().build();
    }

    /**
     * Permanent exclusion
     */
    @DeleteMapping("/{folderId}/permanent")
    public ResponseEntity<Void> permanentDelete(
            @PathVariable UUID folderId,
            JwtAuthenticationToken token) {
        nodeService.permanentDelete(folderId, token);
        return ResponseEntity.noContent().build();
    }
}
