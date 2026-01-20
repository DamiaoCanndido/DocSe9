package com.nergal.docseq.controllers;

import java.util.UUID;

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

import com.nergal.docseq.dto.documents.DocumentDTO;
import com.nergal.docseq.dto.documents.DocumentRequestDTO;
import com.nergal.docseq.dto.documents.DocumentUpdateDTO;
import com.nergal.docseq.services.NoticeService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/notices")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @PreAuthorize("hasAuthority('SCOPE_NOTICE_READ')")
    @GetMapping("")
    public ResponseEntity<DocumentDTO> listNoticesByTown(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int pageSize,
        @RequestParam(required = false) Integer year,
        JwtAuthenticationToken token) {

        var notices = noticeService.listNoticesByTown(page, pageSize, token, year);
        return ResponseEntity.ok(notices);
    }

    @PreAuthorize("hasAuthority('SCOPE_NOTICE_CREATE')")
    @PostMapping("")
    public ResponseEntity<Void> createNotice(@Valid @RequestBody DocumentRequestDTO dto,
        @RequestParam(required = false) Integer year, JwtAuthenticationToken token) {
        noticeService.createNotice(dto, token, year);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_NOTICE_UPDATE')")
    public ResponseEntity<Void> update(
            @PathVariable UUID id,
            @Valid
            @RequestBody DocumentUpdateDTO dto
    ) {
        noticeService.update(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_NOTICE_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        noticeService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }
}
