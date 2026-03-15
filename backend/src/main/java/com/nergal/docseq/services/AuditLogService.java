package com.nergal.docseq.services;

import com.nergal.docseq.dto.logs.AuditLogResponseDTO;
import com.nergal.docseq.dto.logs.LogContentResponse;
import com.nergal.docseq.entities.AuditLog;
import com.nergal.docseq.entities.UserV2;
import com.nergal.docseq.helpers.mappers.PageMapper;
import com.nergal.docseq.repositories.AuditLogRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void saveLog(UserV2 user, String action, String resourceType, UUID resourceId, String details,
            String ipAddress) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public LogContentResponse listLogs(Pageable pageable) {
        // Default sort by timestamp DESC if not provided
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by("timestamp").descending());
        }

        var logPage = auditLogRepository.findAll(pageable)
                .map(this::toDTO);

        return new LogContentResponse(PageMapper.toPageResponse(logPage));
    }

    private AuditLogResponseDTO toDTO(AuditLog log) {
        String townName = null;
        if (log.getUser() != null && log.getUser().getTown() != null) {
            townName = log.getUser().getTown().getName();
        }

        return new AuditLogResponseDTO(
                log.getLogId(),
                log.getTimestamp(),
                log.getUser() != null ? log.getUser().getUserId() : null,
                log.getUser() != null ? log.getUser().getUsername() : "SYSTEM",
                townName,
                log.getAction(),
                log.getResourceType(),
                log.getResourceId(),
                log.getDetails(),
                log.getIpAddress());
    }
}
