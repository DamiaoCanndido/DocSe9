package com.nergal.docseq.dto.permissions;

import org.hibernate.validator.constraints.UUID;

import com.nergal.docseq.entities.PermissionEnum;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PermissionRequestDTO(

    @Enumerated(EnumType.STRING)
    @NotNull(message = "permission name is required")
    PermissionEnum name,

    @UUID(message = "invalid user id format")
    @NotBlank(message = "user id is required")
    String userId
    
) { }
