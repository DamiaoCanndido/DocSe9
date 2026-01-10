package com.nergal.docseq.controllers.dto.folders;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateFolderRequestDTO(
    
        @NotBlank
        @Size(min = 1, max = 255)
        String name,

        UUID parentId
) {}

