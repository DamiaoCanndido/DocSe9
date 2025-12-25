package com.nergal.docseq.controllers.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public record PermissionRequestDTO(
    @NotBlank(message = "permission name is required")
    String name, 

    @NotBlank(message = "user id is required")
    UUID userId
) { }
