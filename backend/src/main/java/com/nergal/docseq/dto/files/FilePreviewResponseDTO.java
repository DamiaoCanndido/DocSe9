package com.nergal.docseq.dto.files;

import java.time.Instant;
import java.util.UUID;

public record FilePreviewResponseDTO(
        UUID fileId,
        String name,
        String previewUrl,
        Instant expiresAt) {
}
