package com.nergal.docseq.exception;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import tools.jackson.databind.exc.InvalidFormatException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        ex.getBindingResult().getGlobalErrors()
                .forEach(error -> errors.put(error.getObjectName(), error.getDefaultMessage()));

        return ResponseEntity.badRequest().body(errors);
    }

    // 403 Forbidden
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(ForbiddenException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new HashMap<>() {
                    {
                        put("error", ex.getMessage());
                    }
                });
    }

    // 404 Not Found
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new HashMap<>() {
                    {
                        put("error", ex.getMessage());
                    }
                });
    }

    // 409 Conflict
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, String>> handleConflict(ConflictException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new HashMap<>() {
                    {
                        put("error", ex.getMessage());
                    }
                });
    }

    // 422 Unprocessable Content
    @ExceptionHandler(UnprocessableContentException.class)
    public ResponseEntity<Map<String, String>> handleUnprocessableContent(UnprocessableContentException ex) {
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_CONTENT)
                .body(new HashMap<>() {
                    {
                        put("error", ex.getMessage());
                    }
                });
    }

    // 400 Bad Request
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new HashMap<>() {
                    {
                        put("error", ex.getMessage());
                    }
                });
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new HashMap<>() {
                    {
                        put("error", ex.getMessage());
                    }
                });
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleJsonErrors(HttpMessageNotReadableException ex) {
        if (ex.getCause() instanceof InvalidFormatException) {
            InvalidFormatException ife = (InvalidFormatException) ex.getCause();

            if (ife.getTargetType().isEnum()) {
                String message = String.format("The value '%s' is invalid. Accepted options: %s",
                        ife.getValue(),
                        Arrays.toString(ife.getTargetType().getEnumConstants()));

                return ResponseEntity.badRequest()
                        .body(new HashMap<>() {
                            {
                                put("error", message);
                            }
                        });
            }
        }

        return ResponseEntity.badRequest().body(new HashMap<>() {
            {
                put("error", "Error reading JSON");
            }
        });
    }
}
