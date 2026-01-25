package com.nergal.docseq.helpers.mappers;

import com.nergal.docseq.dto.folders.FolderResponseDTO;
import com.nergal.docseq.entities.Folder;

public class FolderMapper {

    private FolderMapper() {
    }

    public static FolderResponseDTO toDTO(Folder folder) {
        return new FolderResponseDTO(
                folder.getFolderId(),
                folder.getName(),
                folder.getParent() != null
                        ? folder.getParent().getFolderId()
                        : null,
                folder.getFavorite(),
                folder.getCreatedAt(),
                folder.getUpdatedAt());
    }
}
