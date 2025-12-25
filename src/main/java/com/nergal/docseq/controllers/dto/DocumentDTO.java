package com.nergal.docseq.controllers.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public record DocumentDTO(

    Integer order,

    @NotBlank(message = "Description is required")
    String description,
     
    UUID townshipId
) { }
