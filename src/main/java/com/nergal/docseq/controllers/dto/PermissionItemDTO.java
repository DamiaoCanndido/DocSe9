package com.nergal.docseq.controllers.dto;

import com.nergal.docseq.entities.PermissionEnum;

public record PermissionItemDTO(Long permissionId, PermissionEnum name) {
    
}
