package com.nergal.hello.controllers.validators;

import com.nergal.hello.controllers.dto.RegisterUserDTO;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator
        implements ConstraintValidator<PasswordMatches, RegisterUserDTO> {

    @Override
    public boolean isValid(RegisterUserDTO dto, ConstraintValidatorContext context) {
        if (dto.password() == null || dto.confirmPassword() == null) {
            return false;
        }
        return dto.password().equals(dto.confirmPassword());
    }
}

