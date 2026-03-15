package com.nergal.docseq.dto.logs;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponseDTO(
                UUID logId,
                Instant timestamp,
                UUID userId,
                String username,
                String townName,
                String action,
                String resourceType,
                UUID resourceId,
                String details,
                String ipAddress) {
}
