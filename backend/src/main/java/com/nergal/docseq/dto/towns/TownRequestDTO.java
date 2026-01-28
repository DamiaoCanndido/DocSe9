package com.nergal.docseq.dto.towns;

import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TownRequestDTO(
                @NotNull(message = "Name is required") String name,
                @NotNull(message = "Image URL is required") @Pattern(regexp = "^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$", message = "The URL must be valid.") String imageUrl,
                @NotNull(message = "UF is required") @Length(min = 2, max = 2, message = "UF must have exactly 2 characters") String uf) {
}
