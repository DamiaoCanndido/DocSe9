package com.nergal.docseq.dto.folders;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FolderRequestDTO(

                @NotBlank @Size(min = 1, max = 255) String name,

                UUID parentId) {
}
