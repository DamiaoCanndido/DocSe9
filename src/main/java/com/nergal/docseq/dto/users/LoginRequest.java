package com.nergal.docseq.dto.users;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    String email, 

    @Size(min = 6, message = "Password must have at least 6 characters")
    String password
) {}
