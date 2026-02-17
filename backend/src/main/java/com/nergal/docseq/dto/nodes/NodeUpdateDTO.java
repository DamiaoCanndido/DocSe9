package com.nergal.docseq.dto.nodes;

import java.util.UUID;

public record NodeUpdateDTO(
        String name,
        Boolean favorite,
        UUID parentId // For move operation
) {
}
