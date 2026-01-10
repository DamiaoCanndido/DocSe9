package com.nergal.docseq.controllers.dto.trash;

import java.time.Instant;
import java.util.UUID;

public record TrashItemResponseDTO(
    UUID id,
    String name,
    String type, // FILE or FOLDER
    Instant deletedAt,
    String deletedBy
) {}

