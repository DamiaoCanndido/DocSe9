package com.nergal.docseq.dto.nodes;

import com.nergal.docseq.dto.PageResponse;

public record NodeContentResponse(
                PageResponse<NodeResponseDTO> data) {
}
