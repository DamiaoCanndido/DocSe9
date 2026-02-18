package com.nergal.docseq.dto.nodes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record NodeRequestDTO(
        @NotBlank(message = "Name cannot be blank") @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters") String name,
        UUID parentId) {
}
