package com.nergal.docseq.dto.permissions;

import com.nergal.docseq.entities.PermissionType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PermissionRequestDTO(
        @NotNull(message = "User ID is required") UUID userId,

        @NotNull(message = "folder ID is required") UUID folderId,

        @NotNull(message = "Permission type is required") PermissionType permissionType) {

}
