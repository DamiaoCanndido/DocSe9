package com.nergal.docseq.controllers.dto;

import org.hibernate.validator.constraints.UUID;

import jakarta.validation.constraints.NotBlank;

public record PermissionRequestDTO(

    @NotBlank(message = "permission name is required")
    String name,

    @UUID(message = "invalid user id format")
    @NotBlank(message = "user id is required")
    String userId
    
) { }
