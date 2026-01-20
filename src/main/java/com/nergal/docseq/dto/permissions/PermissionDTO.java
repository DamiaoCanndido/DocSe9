package com.nergal.docseq.dto.permissions;

import java.util.List;

public record PermissionDTO(
    List<PermissionItemDTO> permissions, 
    int page, 
    int pageSize, 
    int totalPages, 
    long totalElements) {
}
