package com.nergal.docseq.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import com.nergal.docseq.dto.PageResponse;
import com.nergal.docseq.dto.roles.RoleItemDTO;
import com.nergal.docseq.dto.towns.TownItemDTO;
import com.nergal.docseq.dto.users.LoginRequest;
import com.nergal.docseq.dto.users.LoginResponse;
import com.nergal.docseq.dto.users.RegisterUserDTO;
import com.nergal.docseq.dto.users.UserContentResponse;
import com.nergal.docseq.dto.users.UserItemDTO;
import com.nergal.docseq.dto.users.UserUpdateDTO;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.Town;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.exception.UnprocessableContentException;
import com.nergal.docseq.helpers.mappers.PageMapper;
import com.nergal.docseq.repositories.RoleRepository;
import com.nergal.docseq.repositories.TownRepository;
import com.nergal.docseq.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private TownRepository townRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtEncoder jwtEncoder;

    @InjectMocks
    private UserService userService;

    private User user;
    private Role basicRole;
    private Town town;
    private UUID townId;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(UUID.randomUUID());
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");

        basicRole = new Role();
        basicRole.setName(Role.Values.basic);
        user.setRoles(Set.of(basicRole));

        townId = UUID.randomUUID();
        town = new Town();
        town.setTownId(townId);
        town.setName("Test Town");
        town.setUf("TT");
        town.setImageUrl("http://example.com/image.png");
    }

    @DisplayName("Register: Should throw UnprocessableContentException when user already exists")
    @Test
    void register_shouldThrowException_whenUserExists() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        assertThrows(UnprocessableContentException.class,
                () -> userService.register(new RegisterUserDTO("user", "test@example.com", "pass", "pass", townId)));
    }

    @DisplayName("Register: Should successfully register a new user with a town")
    @Test
    void register_shouldRegisterUser() {
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());
        when(roleRepository.findByName(Role.Values.basic)).thenReturn(Optional.of(basicRole));
        when(townRepository.findByTownId(any(UUID.class))).thenReturn(Optional.of(town));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        userService.register(new RegisterUserDTO("user", "email@email.com", "pass", "pass", townId));

        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertNotNull(savedUser.getTown(), "Basic user should always have a town.");
    }

    @DisplayName("Login: Should throw BadCredentialsException when user not found")
    @Test
    void login_shouldThrowException_whenUserNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        assertThrows(BadCredentialsException.class, () -> userService.login(new LoginRequest("email", "pass")));
    }

    @DisplayName("Login: Should return LoginResponse on successful authentication")
    @Test
    void login_shouldReturnLoginResponse() {
        User mockUser = mock(User.class);
        when(mockUser.getUserId()).thenReturn(UUID.randomUUID());
        when(mockUser.isLoginCorrect(any(LoginRequest.class), any(BCryptPasswordEncoder.class))).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(jwtEncoder.encode(any(JwtEncoderParameters.class)))
                .thenReturn(Jwt.withTokenValue("token").header("alg", "none").claim("scope", "basic").build());

        LoginResponse response = userService.login(new LoginRequest("test@example.com", "password"));

        assertNotNull(response.accessToken());
        assertEquals(300L, response.expiresIn());
    }

    @DisplayName("Update User: Should successfully update user's basic data")
    @Test
    void updateUser_shouldUpdateUserData() {
        when(userRepository.findById(any())).thenReturn(Optional.of(user));
        when(townRepository.findByTownId(any(UUID.class))).thenReturn(Optional.of(town));

        UserUpdateDTO updateDTO = new UserUpdateDTO("newuser", "new@example.com", null, "newpass", "newpass", townId);
        userService.updateUser(user.getUserId(), updateDTO);

        verify(userRepository).save(any(User.class));
    }

    @DisplayName("Delete User: Should allow a basic user to delete their own account")
    @Test
    void deleteUser_shouldDeleteOwnAccount() {
        UUID userIdToDelete = user.getUserId(); // User trying to delete themselves
        user.setRoles(Set.of(basicRole)); // Ensure the user is a basic user

        when(userRepository.findById(userIdToDelete))
                .thenReturn(Optional.of(user)) // First call for the user performing the action
                .thenReturn(Optional.of(user)); // Second call for the user to be deleted

        JwtAuthenticationToken token = new JwtAuthenticationToken(
                Jwt.withTokenValue("token").header("alg", "none").claim("sub", userIdToDelete.toString()).build(),
                Collections.emptyList());
        userService.deleteUser(userIdToDelete, token);

        verify(userRepository).deleteById(userIdToDelete);
    }

    @DisplayName("Update User: Should throw NotFoundException when user to update is not found")
    @Test
    void updateUser_shouldThrowException_whenUserNotFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        UserUpdateDTO updateDTO = new UserUpdateDTO("newuser", "new@example.com", null, "newpass", "newpass", townId);
        assertThrows(NotFoundException.class, () -> userService.updateUser(UUID.randomUUID(), updateDTO));
    }

    @DisplayName("Delete User: Should allow an admin user to delete any user")
    @Test
    void deleteUser_shouldDeleteUser_whenAdmin() {
        Role adminRole = new Role();
        adminRole.setName(Role.Values.admin);
        User adminUser = new User();
        adminUser.setUserId(UUID.randomUUID());
        adminUser.setRoles(Set.of(adminRole));

        when(userRepository.findById(any(UUID.class)))
                .thenReturn(Optional.of(adminUser))
                .thenReturn(Optional.of(user));

        JwtAuthenticationToken token = new JwtAuthenticationToken(Jwt.withTokenValue("token").header("alg", "none")
                .claim("sub", adminUser.getUserId().toString()).build(), Collections.emptyList());
        userService.deleteUser(user.getUserId(), token);

        verify(userRepository).deleteById(user.getUserId());
    }

    @DisplayName("Delete User: Should throw NotFoundException when target user for deletion is not found")
    @Test
    void deleteUser_shouldThrowNotFoundException_whenUserToDeleteNotFound() {
        UUID adminId = UUID.randomUUID();
        UUID userToDeleteId = UUID.randomUUID();

        Role adminRole = new Role();
        adminRole.setName(Role.Values.admin);
        User adminUser = new User();
        adminUser.setUserId(adminId);
        adminUser.setRoles(Set.of(adminRole));

        when(userRepository.findById(adminId)) // User performing the action (admin)
                .thenReturn(Optional.of(adminUser));
        when(userRepository.findById(userToDeleteId)) // User to be deleted (not found)
                .thenReturn(Optional.empty());

        JwtAuthenticationToken token = new JwtAuthenticationToken(
                Jwt.withTokenValue("token").header("alg", "none").claim("sub", adminId.toString()).build(),
                Collections.emptyList());

        assertThrows(NotFoundException.class, () -> userService.deleteUser(userToDeleteId, token));
    }

    @DisplayName("Delete User: Should throw ForbiddenException when non-admin tries to delete another user")
    @Test
    void deleteUser_shouldThrowException_whenNotAdmin() {
        user.setUserId(UUID.randomUUID());
        User otherUser = new User();
        otherUser.setUserId(UUID.randomUUID());
        when(userRepository.findById(any(UUID.class)))
                .thenReturn(Optional.of(user))
                .thenReturn(Optional.of(otherUser));

        JwtAuthenticationToken token = new JwtAuthenticationToken(
                Jwt.withTokenValue("token").header("alg", "none").claim("sub", user.getUserId().toString()).build(),
                Collections.emptyList());
        assertThrows(ForbiddenException.class, () -> userService.deleteUser(otherUser.getUserId(), token));
    }

    @DisplayName("Update User: Should throw NotFoundException when provided town ID does not exist")
    @Test
    void updateUser_shouldThrowNotFoundException_whenTownIdNotFound() {
        UUID userId = user.getUserId();
        UUID nonExistentTownId = UUID.randomUUID();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(townRepository.findByTownId(nonExistentTownId)).thenReturn(Optional.empty());

        UserUpdateDTO updateDTO = new UserUpdateDTO("newuser", "new@example.com", null, "newpass", "newpass",
                nonExistentTownId);
        assertThrows(NotFoundException.class, () -> userService.updateUser(userId, updateDTO));
    }

    @DisplayName("Update User: Should correctly update specified fields (username, email, password)")
    @Test
    void updateUser_shouldUpdateSpecificFields() {
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        UUID userId = user.getUserId();
        String newUsername = "newusername";
        String newEmail = "newemail@example.com";
        String newPassword = "newpassword";
        String encodedNewPassword = "encodedNewPassword";

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPassword);

        UserUpdateDTO updateDTO = new UserUpdateDTO(newUsername, newEmail, null, newPassword, newPassword, null);
        userService.updateUser(userId, updateDTO);

        verify(userRepository).save(userCaptor.capture());
        User updatedUser = userCaptor.getValue();

        assertEquals(newUsername, updatedUser.getUsername());
        assertEquals(newEmail, updatedUser.getEmail());
        assertEquals(encodedNewPassword, updatedUser.getPassword());
        assertNull(updatedUser.getTown()); // Town should remain null as no townId was provided in DTO
    }

    @DisplayName("Login: Should throw BadCredentialsException when password is incorrect")
    @Test
    void login_shouldThrowException_whenIncorrectPassword() {
        User mockUser = mock(User.class);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(mockUser.isLoginCorrect(any(LoginRequest.class), any(BCryptPasswordEncoder.class))).thenReturn(false);

        assertThrows(BadCredentialsException.class,
                () -> userService.login(new LoginRequest("test@example.com", "wrongpass")));
    }

    @DisplayName("Register: Should throw NotFoundException when provided town ID does not exist")
    @Test
    void register_shouldThrowNotFoundException_whenTownNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());
        when(roleRepository.findByName(Role.Values.basic)).thenReturn(Optional.of(basicRole));
        when(townRepository.findByTownId(any(UUID.class))).thenReturn(Optional.empty()); // Town not found

        assertThrows(NotFoundException.class,
                () -> userService
                        .register(new RegisterUserDTO("user", "email@email.com", "pass", "pass", UUID.randomUUID())));
    }

    @DisplayName("Register: Should create basic role if it does not exist")
    @Test
    void register_shouldCreateBasicRoleIfNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());
        when(roleRepository.findByName(Role.Values.basic)).thenReturn(Optional.empty()); // Basic role not found
        when(roleRepository.save(any(Role.class))).thenReturn(basicRole); // Mock saving the new basic role
        when(townRepository.findByTownId(any(UUID.class))).thenReturn(Optional.of(town)); // Town found
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        userService.register(new RegisterUserDTO("user", "email@email.com", "pass", "pass", townId));

        verify(roleRepository).save(any(Role.class)); // Verify that basic role was saved
        verify(userRepository).save(any(User.class));
    }

    @DisplayName("Register: Should register a user with a null town ID")
    @Test
    void register_shouldRegisterUserWithNullTownId() {
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());
        when(roleRepository.findByName(Role.Values.basic)).thenReturn(Optional.of(basicRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        userService.register(new RegisterUserDTO("user", "email@email.com", "pass", "pass", null));

        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertNull(savedUser.getTown(), "Basic user should not have a town when townId is null.");
    }

    @DisplayName("List Users: Should return a page of users")
    @Test
    void listUsers_shouldReturnPageOfUsers() {
        // Mock data
        Role adminRole = new Role();
        adminRole.setRoleId(1L);
        adminRole.setName(Role.Values.admin);

        Town mockTown = new Town();
        mockTown.setTownId(UUID.randomUUID());
        mockTown.setName("Mock Town");
        mockTown.setUf("MT");
        mockTown.setImageUrl("http://mocktown.com/image.png");

        User user1 = new User();
        user1.setUserId(UUID.randomUUID());
        user1.setUsername("user1");
        user1.setEmail("user1@example.com");
        user1.setRoles(Set.of(basicRole));
        user1.setTown(mockTown);

        User user2 = new User();
        user2.setUserId(UUID.randomUUID());
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");
        user2.setRoles(Set.of(adminRole));
        user2.setTown(mockTown);

        List<User> userList = Arrays.asList(user1, user2);
        Page<User> userPage = new PageImpl<>(userList, PageRequest.of(0, 10), userList.size());

        // Mock userRepository.findAll()
        when(userRepository.findAll(any(Pageable.class))).thenReturn(userPage);

        // Expected DTOs
        UserItemDTO userItemDTO1 = new UserItemDTO(
                user1.getUserId(),
                user1.getUsername(),
                user1.getEmail(),
                Collections.singletonList(new RoleItemDTO(basicRole.getRoleId(), basicRole.getName())),
                new TownItemDTO(mockTown.getTownId(), mockTown.getName(), mockTown.getUf(), mockTown.getImageUrl()),
                user1.getCreatedAt());
        UserItemDTO userItemDTO2 = new UserItemDTO(
                user2.getUserId(),
                user2.getUsername(),
                user2.getEmail(),
                Collections.singletonList(new RoleItemDTO(adminRole.getRoleId(), adminRole.getName())),
                new TownItemDTO(mockTown.getTownId(), mockTown.getName(), mockTown.getUf(), mockTown.getImageUrl()),
                user2.getCreatedAt());
        List<UserItemDTO> userItemDTOList = Arrays.asList(userItemDTO1, userItemDTO2);
        PageResponse<UserItemDTO> pageResponse = new PageResponse<>(userItemDTOList, 0, 10, userList.size(), 1, true);

        // Mock static PageMapper.toPageResponse
        try (MockedStatic<PageMapper> mockedStatic = mockStatic(PageMapper.class)) {
            mockedStatic.when(() -> PageMapper.toPageResponse((Page<?>) any(Page.class))).thenReturn(pageResponse);

            // Call the service method
            UserContentResponse response = userService.listUsers(PageRequest.of(0, 10));

            // Assertions
            assertNotNull(response);
            assertNotNull(response.users());
            assertEquals(2, response.users().content().size());
            assertEquals(userItemDTO1.userId(), response.users().content().get(0).userId());
            assertEquals(userItemDTO2.userId(), response.users().content().get(1).userId());

            verify(userRepository).findAll(any(Pageable.class));
            mockedStatic.verify(() -> PageMapper.toPageResponse((Page<?>) any(Page.class)));
        }
    }
}
