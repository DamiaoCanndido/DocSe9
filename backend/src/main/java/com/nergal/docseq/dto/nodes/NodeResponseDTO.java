package com.nergal.docseq.dto.nodes;

import com.nergal.docseq.entities.NodeType;
import java.time.Instant;
import java.util.UUID;

public record NodeResponseDTO(
        UUID id,
        String name,
        NodeType nodeType,
        Boolean favorite,
        UUID parentId,
        UUID townId,
        UUID createdBy,
        String createdByName,
        UUID updatedBy,
        String updatedByName,
        UUID deletedBy,
        String deletedByName,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt,
        // File specific fields
        String contentType,
        Long size,
        String objectKey,
        Instant lastSeen
) {
}
