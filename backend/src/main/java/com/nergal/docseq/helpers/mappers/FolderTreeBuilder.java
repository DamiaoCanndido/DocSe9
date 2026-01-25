package com.nergal.docseq.helpers.mappers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.nergal.docseq.dto.folders.FolderTreeResponseDTO;
import com.nergal.docseq.entities.Folder;

public class FolderTreeBuilder {

    private FolderTreeBuilder() {
    }

    public static List<FolderTreeResponseDTO> build(List<Folder> folders) {

        Map<UUID, FolderTreeResponseDTO> folderMap = new HashMap<>();

        List<FolderTreeResponseDTO> roots = new ArrayList<>();

        for (Folder folder : folders) {
            folderMap.put(
                    folder.getFolderId(),
                    new FolderTreeResponseDTO(
                            folder.getFolderId(),
                            folder.getName(),
                            folder.getFavorite(),
                            new ArrayList<>()));
        }

        for (Folder folder : folders) {

            FolderTreeResponseDTO current = folderMap.get(folder.getFolderId());

            if (folder.getParent() == null) {
                roots.add(current);
            } else {
                FolderTreeResponseDTO parent = folderMap.get(folder.getParent().getFolderId());

                if (parent != null) {
                    parent.children().add(current);
                }
            }
        }

        return roots;
    }
}
