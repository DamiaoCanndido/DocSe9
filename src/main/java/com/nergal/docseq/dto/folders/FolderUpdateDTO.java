package com.nergal.docseq.dto.folders;

import jakarta.validation.constraints.Size;

public record FolderUpdateDTO(

    @Size(min = 1, max = 255)
    String name,

    Boolean favorite
) { }
