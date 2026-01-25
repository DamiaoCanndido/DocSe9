package com.nergal.docseq.dto.towns;

import com.nergal.docseq.dto.PageResponse;

public record TownContentResponse(
    PageResponse<TownItemDTO> towns
) { }
