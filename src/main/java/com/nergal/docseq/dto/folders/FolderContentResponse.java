package com.nergal.docseq.dto.folders;

import com.nergal.docseq.dto.PageResponse;
import com.nergal.docseq.dto.files.FileResponseDTO;

public record FolderContentResponse(
    PageResponse<FolderResponseDTO> folders,
    PageResponse<FileResponseDTO> files
) { }
