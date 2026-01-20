package com.nergal.docseq.dto.documents;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public record DocumentRequestDTO(

    Integer order,

    @NotBlank(message = "Description is required")
    String description,
     
    UUID townId
) { }
