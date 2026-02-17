package com.nergal.docseq.dto.search;

import com.nergal.docseq.dto.files.FileResponseDTO;
import com.nergal.docseq.dto.folders.FolderResponseDTO;

import java.util.List;

public record SearchResponseDTO(
        List<FolderResponseDTO> folders,
        List<FileResponseDTO> files) {
}