package com.nergal.docseq.controllers.dto.folders;

import jakarta.validation.constraints.Size;

public record UpdateFolderRequestDTO(

    @Size(min = 1, max = 255)
    String name,

    Boolean favorite
) { }
