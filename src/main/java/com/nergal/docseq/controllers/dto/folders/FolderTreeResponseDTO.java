package com.nergal.docseq.controllers.dto.folders;

import java.util.List;
import java.util.UUID;

public record FolderTreeResponseDTO(
    UUID folderId,
    String name,
    boolean favorite,
    List<FolderTreeResponseDTO> children
) {}

