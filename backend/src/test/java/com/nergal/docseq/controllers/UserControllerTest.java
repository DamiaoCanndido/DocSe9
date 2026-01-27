package com.nergal.docseq.controllers;

import com.nergal.docseq.dto.users.LoginRequest;
import com.nergal.docseq.dto.users.RegisterUserDTO;
import com.nergal.docseq.dto.users.UserUpdateDTO;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.services.UserService;

import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import org.junit.jupiter.api.DisplayName;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private RegisterUserDTO registerUserDTO;
    private UserUpdateDTO userUpdateDTO;
    private LoginRequest loginRequest;
    private UUID userId;
    private UUID townId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        townId = UUID.randomUUID();
        registerUserDTO = new RegisterUserDTO(
                "testuser",
                "test@example.com",
                Role.Values.basic,
                "password",
                "password",
                townId);
        userUpdateDTO = new UserUpdateDTO(
                "newuser",
                "new@example.com",
                Role.Values.basic,
                "newpassword",
                "newpassword",
                townId);
        loginRequest = new LoginRequest("test@example.com", "password");
    }

    @Test
    @DisplayName("Should register a new user")
    void testRegister() throws Exception {
        doNothing().when(userService).register(any(RegisterUserDTO.class));

        mockMvc.perform(post("/register").with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerUserDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("It should return a JSON error if the request body is null when attempting to register a user.")
    void testRegisterIfRequestBodyIsNull() throws Exception {
        doNothing().when(userService).register(any(RegisterUserDTO.class));

        mockMvc.perform(post("/register").with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(null)))
                .andExpect(jsonPath("$.error").value("Error reading JSON"));
    }

    @Test
    @DisplayName("Should list all users")
    void testListUsers() throws Exception {
        mockMvc.perform(get("/users").with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin"))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should login a user and return a token")
    void testLogin() throws Exception {
        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update an existing user")
    void testUpdateUser() throws Exception {
        doNothing().when(userService).updateUser(any(UUID.class), any(UserUpdateDTO.class));

        mockMvc.perform(patch("/user/{id}", userId).with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userUpdateDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete a user")
    void testDeleteUser() throws Exception {
        doNothing().when(userService).deleteUser(any(UUID.class), any());

        mockMvc.perform(delete("/user/{id}", userId).with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin"))))
                .andExpect(status().isOk());
    }
}