package com.nergal.docseq.dto.nodes;

import java.util.List;
import java.util.UUID;

public record NodeTreeResponseDTO(
        UUID id,
        String name,
        List<NodeTreeResponseDTO> children
) {
}
