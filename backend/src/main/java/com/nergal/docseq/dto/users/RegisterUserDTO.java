package com.nergal.docseq.dto.users;

import java.util.UUID;

import com.nergal.docseq.entities.Role;
import com.nergal.docseq.helpers.validators.PasswordConfirmable;
import com.nergal.docseq.helpers.validators.PasswordMatches;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@PasswordMatches
public record RegisterUserDTO(
        @NotBlank(message = "Username is required") String username,

        @Email(message = "Invalid email") @NotBlank(message = "Email is required") String email,

        @NotNull(message = "Role is required") @Enumerated(EnumType.STRING) Role.Values role,

        @Size(min = 6, message = "Password must have at least 6 characters") String password,

        @NotBlank(message = "Confirm password is required") String confirmPassword,

        @NotNull(message = "town is required") UUID townId) implements PasswordConfirmable {
}
