package com.nergal.docseq.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.nergal.docseq.dto.users.LoginRequest;
import com.nergal.docseq.dto.users.RegisterUserDTO;
import com.nergal.docseq.dto.users.UserUpdateDTO;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.services.UserService;

import tools.jackson.databind.ObjectMapper;

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
        private RegisterUserDTO invalidRegisterUserDTO;
        private UserUpdateDTO userUpdateDTO;
        private UserUpdateDTO userUpdateInvalidDTO;
        private LoginRequest loginRequest;
        private LoginRequest invalidLoginRequest;
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
                invalidRegisterUserDTO = new RegisterUserDTO(
                                "",
                                "invalid-email",
                                Role.Values.basic,
                                "pass",
                                "differentpass",
                                null);
                userUpdateDTO = new UserUpdateDTO(
                                "newuser",
                                "new@example.com",
                                Role.Values.basic,
                                "newpassword",
                                "newpassword",
                                townId);
                userUpdateInvalidDTO = new UserUpdateDTO(
                                "",
                                "invalid-email",
                                Role.Values.basic,
                                "short",
                                "diffpass",
                                null);
                loginRequest = new LoginRequest("test@example.com", "password");
                invalidLoginRequest = new LoginRequest("invalid-email", "123");
        }

        @Test
        @DisplayName("Should register a new user")
        void testRegister() throws Exception {
                mockMvc.perform(post("/register")
                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin"),
                                                new SimpleGrantedAuthority("SCOPE_manager")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerUserDTO)))
                                .andExpect(status().isOk());
                verify(userService).register(any(RegisterUserDTO.class));
        }

        @Test
        @DisplayName("It should return a JSON error if the request body is null when attempting to register a user.")
        void testRegisterIfRequestBodyIsNull() throws Exception {

                mockMvc.perform(post("/register")
                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error").value("Error reading JSON"));

                verifyNoInteractions(userService);
        }

        @Test
        @DisplayName("It should return error 400 if the fields are invalid when attempting to register a user.")
        void testRegisterIfFieldsAreInvalid() throws Exception {

                mockMvc.perform(post("/register").with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRegisterUserDTO)))
                                .andExpect(status().isBadRequest());

                verifyNoInteractions(userService);
        }

        @Test
        @DisplayName("Should list all users")
        void testListUsers() throws Exception {
                mockMvc.perform(get("/users")
                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin"))))
                                .andExpect(status().isOk());

                verify(userService).listUsers(any());
        }

        @Test
        @DisplayName("It should return error 400 if the fields are invalid when attempting to login a user.")
        void testLoginIfFieldsAreInvalid() throws Exception {
                mockMvc.perform(post("/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidLoginRequest)))
                                .andExpect(status().isBadRequest());

                verifyNoInteractions(userService);
        }

        @Test
        @DisplayName("Should login a user and return a token")
        void testLoginIfRequestBodyIsNull() throws Exception {
                mockMvc.perform(post("/login")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error").value("Error reading JSON"));

                verifyNoInteractions(userService);
        }

        @Test
        @DisplayName("Should login a user and return a token")
        void testLogin() throws Exception {
                mockMvc.perform(post("/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andExpect(status().isOk());

                verify(userService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should update an existing user")
        void testUpdateUser() throws Exception {
                mockMvc.perform(patch("/user/{id}", userId)
                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userUpdateDTO)))
                                .andExpect(status().isOk());

                verify(userService).updateUser(eq(userId), any(UserUpdateDTO.class));
        }

        @Test
        @DisplayName("It should return a error 400 if the request body is null when attempting to update a user.")
        void testUpdateUserIfRequestBodyIsNull() throws Exception {

                mockMvc.perform(patch("/user/{id}", userId)
                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error").value("Error reading JSON"));

                verifyNoInteractions(userService);
        }

        @Test
        @DisplayName("It should return error 400 if the fields are invalid when attempting to update a user.")
        void testUpdateUserIfFieldsAreInvalid() throws Exception {

                mockMvc.perform(patch("/user/{id}", userId)
                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userUpdateInvalidDTO)))
                                .andExpect(status().isBadRequest());

                verifyNoInteractions(userService);
        }

        @Test
        @DisplayName("It should return error 400 if the userId is invalid when attempting to update a user.")
        void testUpdateUserIfUserIsInvalid() throws Exception {

                mockMvc.perform(
                                patch("/user/{id}", "invalid-id")
                                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin")))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(userUpdateDTO)))
                                .andExpect(status().isBadRequest());

                verifyNoInteractions(userService);
        }

        @Test
        @DisplayName("Should delete a user")
        void testDeleteUser() throws Exception {
                mockMvc.perform(delete("/user/{id}", userId)
                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin"))))
                                .andExpect(status().isOk());

                verify(userService).deleteUser(eq(userId), any());
        }

        @Test
        @DisplayName("It should return error 400 if the userId is invalid when attempting to delete a user.")
        void testDeleteUserIfUserIsInvalid() throws Exception {

                mockMvc.perform(
                                delete("/user/{id}", "invalid-id")
                                                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_admin"))))
                                .andExpect(status().isBadRequest());

                verifyNoInteractions(userService);
        }
}