package com.nergal.docseq.controllers;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.dto.users.LoginRequest;
import com.nergal.docseq.dto.users.LoginResponse;
import com.nergal.docseq.dto.users.RegisterUserDTO;
import com.nergal.docseq.dto.users.UserContentResponse;
import com.nergal.docseq.dto.users.UserUpdateDTO;
import com.nergal.docseq.services.UserService;

import jakarta.validation.Valid;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterUserDTO dto) {
        userService.register(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<UserContentResponse> listUsers(
            Pageable pageable) {
        return ResponseEntity.ok(userService.listUsers(pageable));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.login(loginRequest));
    }

    @PatchMapping("/user/{id}")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public ResponseEntity<Void> updateUser(@PathVariable("id") UUID userId, @Valid @RequestBody UserUpdateDTO dto) {
        userService.updateUser(userId, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") UUID userId, JwtAuthenticationToken token) {
        userService.deleteUser(userId, token);
        return ResponseEntity.ok().build();
    }
}
