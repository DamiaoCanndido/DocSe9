package com.nergal.docseq.dto.folders;

import java.time.Instant;
import java.util.UUID;

public record FolderResponseDTO(
        UUID folderId,
        String name,
        UUID parentId,
        boolean favorite,
        Instant createdAt,
        Instant updatedAt) {
}
