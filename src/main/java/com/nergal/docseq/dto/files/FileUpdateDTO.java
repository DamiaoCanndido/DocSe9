package com.nergal.docseq.dto.files;

import java.util.UUID;

import jakarta.validation.constraints.Size;

public record FileUpdateDTO(

    @Size(min = 1, max = 255)
    String name,

    UUID folderId,

    Boolean favorite
) {}

