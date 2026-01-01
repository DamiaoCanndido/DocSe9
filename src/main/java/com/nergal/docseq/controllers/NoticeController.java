package com.nergal.docseq.controllers;


import java.util.List;
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
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.controllers.dto.DocumentRequestDTO;
import com.nergal.docseq.controllers.dto.UpdateDocumentDTO;
import com.nergal.docseq.entities.Notice;
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
    public ResponseEntity<List<Notice>> listNoticesByTownship(JwtAuthenticationToken token) {
        return ResponseEntity.ok(noticeService.listNoticesByTownship(token));
    }

    @PreAuthorize("hasAuthority('SCOPE_NOTICE_CREATE')")
    @PostMapping("")
    public ResponseEntity<Void> createNotice(@Valid @RequestBody DocumentRequestDTO dto, JwtAuthenticationToken token) {
        noticeService.createNotice(dto, token);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_NOTICE_UPDATE')")
    public ResponseEntity<Void> update(
            @PathVariable UUID id,
            @RequestBody UpdateDocumentDTO dto
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
