package com.nergal.docseq.dto.users;

import com.nergal.docseq.helpers.validators.PasswordConfirmable;
import com.nergal.docseq.helpers.validators.PasswordMatches;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@PasswordMatches
public record UserProfileUpdateDTO(
        @Size(min = 3, message = "Username must be at least 3 characters long") String username,

        @Email(message = "Email should be valid") String email,

        @Size(min = 6, message = "Password must have at least 6 characters") String password,

        @Size(min = 6, message = "Password must have at least 6 characters") String confirmPassword) implements PasswordConfirmable {
}
