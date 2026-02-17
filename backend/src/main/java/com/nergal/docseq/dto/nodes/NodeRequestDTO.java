package com.nergal.docseq.dto.nodes;

import com.nergal.docseq.entities.NodeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record NodeRequestDTO(
                @NotBlank(message = "Name cannot be blank") @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters") String name,
                @NotNull(message = "Node type cannot be null") NodeType nodeType,
                UUID parentId) {
}
