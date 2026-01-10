package com.nergal.docseq.controllers.dto.folders;

import java.time.Instant;
import java.util.UUID;

public record FolderResponseDTO(
    UUID folderId,
    String name,
    UUID parentId,
    boolean favorite,
    Instant createdAt,
    Instant updatedAt
) {}

