package com.nergal.docseq.controllers.dto.mappers;

import com.nergal.docseq.controllers.dto.files.FileResponseDTO;
import com.nergal.docseq.entities.File;

public final class FileMapper {

    private FileMapper() {}

    public static FileResponseDTO toResponse(File entity) {
        if (entity == null) {
            return null;
        }

        return new FileResponseDTO(
                entity.getFileId(),
                entity.getName(),
                entity.getSize(),
                entity.getContentType(),
                entity.getFavorite(),
                entity.getLastSeen(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getFolder() != null
                        ? entity.getFolder().getFolderId()
                        : null,
                entity.getUpdatedBy() != null
                        ? entity.getUploadedBy().getUsername()
                        : null
        );
    }
}
