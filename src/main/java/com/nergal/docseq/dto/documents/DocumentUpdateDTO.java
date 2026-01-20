package com.nergal.docseq.dto.documents;

import jakarta.validation.constraints.Min;

public record DocumentUpdateDTO(
    @Min(value = 1, message = "Order cannot be zero")
    Integer order,

    @Min(value = 3, message = "Username must be at least 3 characters long")
    String description
) { }
