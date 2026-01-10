package com.nergal.docseq.controllers.dto.files;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateFileRequestDTO(

    @NotBlank
    @Size(min = 1, max = 255)
    String name,

    UUID folderId
) {}
