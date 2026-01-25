package com.nergal.docseq.dto.files;

import java.time.Instant;
import java.util.UUID;

public record FileResponseDTO(
        UUID fileId,
        String name,
        Long size,
        String contentType,
        boolean favorite,
        Instant lastSeen,
        Instant createdAt,
        Instant updatedAt,
        UUID folderId,
        String uploadedBy) {
}
