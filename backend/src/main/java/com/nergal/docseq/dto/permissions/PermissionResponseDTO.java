package com.nergal.docseq.dto.permissions;

import com.nergal.docseq.entities.PermissionType;
import java.time.Instant;
import java.util.UUID;

public record PermissionResponseDTO(
                UUID permissionId,
                UUID userId,
                String username,
                UUID nodeId,
                String name,
                PermissionType permissionType,
                UUID grantedByUserId,
                String grantedByUsername,
                Instant createdAt) {
}
