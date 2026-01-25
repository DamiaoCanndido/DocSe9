package com.nergal.docseq.dto.folders;

import java.util.List;
import java.util.UUID;

public record FolderTreeResponseDTO(
    UUID folderId,
    String name,
    boolean favorite,
    List<FolderTreeResponseDTO> children
) {}

