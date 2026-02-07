package com.nergal.docseq.dto.permissions;

import com.nergal.docseq.entities.PermissionType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PermissionRequestDTO(
    @NotNull(message = "User ID is required")
    UUID userId,

    UUID folderId,

    UUID fileId,

    @NotNull(message = "Permission type is required")
    PermissionType permissionType
) {
    // Custom validation to ensure either folderId or fileId is present, but not both
    public PermissionRequestDTO {
        if (folderId == null && fileId == null) {
            throw new IllegalArgumentException("Either folderId or fileId must be provided.");
        }
        if (folderId != null && fileId != null) {
            throw new IllegalArgumentException("Cannot provide both folderId and fileId.");
        }
    }
}
