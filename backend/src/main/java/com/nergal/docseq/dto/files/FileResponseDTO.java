package com.nergal.docseq.dto.files;

import java.time.Instant;
import java.util.UUID;

public record FileResponseDTO(
                UUID fileId,
                String name,
                Long size,
                String contentType,
                String objectKey,
                boolean favorite,
                Instant lastSeen,
                Instant createdAt,
                Instant updatedAt,
                Instant deletedAt,
                UUID folderId,
                String uploadedBy) {
}
