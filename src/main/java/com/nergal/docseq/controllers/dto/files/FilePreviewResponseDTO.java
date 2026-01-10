package com.nergal.docseq.controllers.dto.files;

import java.time.Instant;
import java.util.UUID;

public record FilePreviewResponseDTO(
    UUID fileId,
    String name,
    String previewUrl,
    Instant expiresAt
) {}

