package com.nergal.docseq.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

import com.nergal.docseq.dto.files.FileResponseDTO;
import com.nergal.docseq.dto.folders.FolderUpdateDTO;
import com.nergal.docseq.services.FileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> upload(
            @RequestParam MultipartFile file,
            @RequestParam(required = false) UUID folderId,
            JwtAuthenticationToken token) {
        fileService.upload(file, folderId, token);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> softDelete(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token) {
        fileService.softDelete(fileId, token);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{fileId}/restore")
    public ResponseEntity<Void> restore(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token) {
        fileService.restore(fileId, token);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{fileId}/permanent")
    public ResponseEntity<Void> permanentDelete(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token) {
        fileService.permanentDelete(fileId, token);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{fileId}/rename")
    public ResponseEntity<Void> rename(
            @PathVariable UUID fileId,
            @Valid @RequestBody FolderUpdateDTO dto,
            JwtAuthenticationToken token) {
        fileService.rename(fileId, dto, token);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{fileId}/move/{targetFolderId}")
    public ResponseEntity<Void> move(
            @PathVariable UUID fileId,
            @PathVariable UUID targetFolderId,
            JwtAuthenticationToken token) {
        fileService.move(fileId, targetFolderId, token);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{fileId}/favorite")
    public ResponseEntity<FileResponseDTO> toggleFavorite(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token) {
        fileService.toggleFavorite(fileId, token);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{fileId}/view-url")
    public ResponseEntity<Map<String, String>> generateUrl(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token) {
        String url = fileService.generateViewUrl(fileId, token);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
