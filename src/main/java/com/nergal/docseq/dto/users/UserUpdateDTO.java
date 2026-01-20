package com.nergal.docseq.dto.users;

import java.util.UUID;

import com.nergal.docseq.entities.Role;
import com.nergal.docseq.helpers.validators.PasswordConfirmable;
import com.nergal.docseq.helpers.validators.PasswordMatches;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@PasswordMatches
public record UserUpdateDTO(
    @Min(value = 3, message = "Username must be at least 3 characters long")
    String username, 

    @Email(message = "Email should be valid")
    String email,

    @Enumerated(EnumType.STRING)
    Role.Values role,

    @Size(min = 6, message = "Password must have at least 6 characters")
    String password, 

    @Size(min = 6, message = "Password must have at least 6 characters")
    String confirmPassword,

    UUID townId
) implements PasswordConfirmable { }
