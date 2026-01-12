package com.nergal.docseq.controllers;

import com.nergal.docseq.controllers.dto.files.FileResponseDTO;
import com.nergal.docseq.services.FileService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }
    

    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Void> upload(
            @RequestParam MultipartFile file,
            @RequestParam(required = false) UUID folderId,
            JwtAuthenticationToken token
    ) {
        fileService.upload(file, folderId, token);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> softDelete(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token
    ) {
        fileService.softDelete(fileId, token);
        return ResponseEntity.noContent().build();
    }

    
    @PostMapping("/{fileId}/restore")
    public ResponseEntity<Void> restore(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token
    ) {
        fileService.restore(fileId);
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/{fileId}/permanent")
    public ResponseEntity<Void> permanentDelete(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token
    ) {
        fileService.permanentDelete(fileId);
        return ResponseEntity.noContent().build();
    }


    @PatchMapping("/{fileId}/favorite")
    public ResponseEntity<FileResponseDTO> toggleFavorite(
            @PathVariable UUID fileId,
            JwtAuthenticationToken token
    ) {
        fileService.toggleFavorite(fileId);
        return ResponseEntity.ok().build();
    }

    
    @GetMapping("/{fileId}/view-url")
    public Map<String, String> generateUrl(@PathVariable UUID fileId) {
        String url = fileService.generateViewUrl(fileId);
        return Map.of("url", url);
    }
}

