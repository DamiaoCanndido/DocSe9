package com.nergal.docseq.controllers.dto.files;

import java.time.Instant;
import java.util.UUID;

public record FileResponseDTO(
    UUID fileId,
    String name,
    String contentType,
    Long size,
    boolean favorite,
    Instant lastSeen,
    Instant createdAt,
    Instant updatedAt,
    UUID folderId
) {}

