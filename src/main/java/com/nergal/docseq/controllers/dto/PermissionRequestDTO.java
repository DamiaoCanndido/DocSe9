package com.nergal.docseq.controllers.dto;

import jakarta.validation.constraints.NotBlank;

public record PermissionRequestDTO(

    @NotBlank(message = "permission name is required")
    String name
    
) { }
