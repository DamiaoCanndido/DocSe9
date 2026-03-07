package com.nergal.docseq.dto.users;

import com.nergal.docseq.helpers.validators.PasswordConfirmable;
import com.nergal.docseq.helpers.validators.PasswordMatches;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@PasswordMatches
public record ChangePasswordRequest(
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String newPassword,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword) implements PasswordConfirmable {

    @Override
    public String password() {
        return newPassword;
    }
}
