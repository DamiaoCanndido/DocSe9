package com.nergal.docseq.controllers;

import com.nergal.docseq.dto.logs.LogContentResponse;
import com.nergal.docseq.services.AuditLogService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v2/logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<LogContentResponse> getLogs(Pageable pageable) {
        return ResponseEntity.ok(auditLogService.listLogs(pageable));
    }
}
