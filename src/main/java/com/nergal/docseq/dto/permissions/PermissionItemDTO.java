package com.nergal.docseq.dto.permissions;

import com.nergal.docseq.entities.PermissionEnum;

public record PermissionItemDTO(Long permissionId, PermissionEnum name) {
    
}
