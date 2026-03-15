package com.nergal.docseq.services;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.dto.roles.RoleItemDTO;
import com.nergal.docseq.dto.towns.TownItemDTO;
import com.nergal.docseq.dto.users.ChangePasswordRequest;
import com.nergal.docseq.dto.users.ForgotPasswordRequest;
import com.nergal.docseq.dto.users.LoginRequest;
import com.nergal.docseq.dto.users.LoginResponse;
import com.nergal.docseq.dto.users.RegisterUserDTO;
import com.nergal.docseq.dto.users.ResetPasswordRequest;
import com.nergal.docseq.dto.users.UserContentResponse;
import com.nergal.docseq.dto.users.UserItemDTO;
import com.nergal.docseq.dto.users.UserUpdateDTO;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.TownV2;
import com.nergal.docseq.entities.UserV2;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.exception.UnprocessableContentException;
import com.nergal.docseq.helpers.mappers.PageMapper;
import com.nergal.docseq.helpers.specifications.UserV2Specifications;
import com.nergal.docseq.repositories.RoleRepository;
import com.nergal.docseq.repositories.TownV2Repository;
import com.nergal.docseq.repositories.UserV2Repository;

@Service
public class UserV2Service {

    private final UserV2Repository userRepository;
    private final RoleRepository roleRepository;
    private final TownV2Repository townRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final AuditLogService auditLogService;

    public UserV2Service(
            UserV2Repository userRepository,
            RoleRepository roleRepository,
            TownV2Repository townRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            AuditLogService auditLogService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.townRepository = townRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public void register(RegisterUserDTO dto, JwtAuthenticationToken token) {

        if (userRepository.findByEmail(dto.email()).isPresent() ||
                userRepository.findByUsername(dto.username()).isPresent()) {
            throw new UnprocessableContentException("user already exists");
        }

        // Fetch the role specified in the DTO
        var userRole = roleRepository.findByName(dto.role()).orElseThrow(
                () -> new NotFoundException("Role not found"));

        TownV2 town = null;

        // Conditional validation for townId based on the actual userRole
        if (userRole.getName() != Role.Values.admin && dto.townId() == null) {
            throw new UnprocessableContentException("Town must be provided for basic and manager users");
        }
        if (userRole.getName() == Role.Values.admin && dto.townId() != null) {
            throw new UnprocessableContentException("admins cannot be created with a town");
        }

        final UserV2 currentUser = getUser(token);

        if (currentUser.getRole().getName().equals(Role.Values.manager) && dto.role().equals(Role.Values.admin)) {
            throw new UnprocessableContentException("Manager cannot create admin.");
        }

        // The manager can only create one user for another town.
        if (dto.townId() != null) {
            if (currentUser.getRole().getName().equals(Role.Values.admin)) {
                town = townRepository.findByTownId(dto.townId()).orElseThrow(
                        () -> new NotFoundException("Town not found"));
            } else {
                town = currentUser.getTown();
            }
        }

        var user = new UserV2();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRole(userRole);
        user.setTown(town);

        userRepository.save(user);

        auditLogService.saveLog(currentUser, "REGISTER_USER", "USER", user.getUserId(),
                "User registered: " + user.getUsername(), null);
    }

    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        var user = userRepository.findByEmail(loginRequest.email());

        if (user.isEmpty() || !user.get().isLoginCorrect(loginRequest, passwordEncoder)) {
            throw new BadCredentialsException("user or password invalid");
        }

        var now = Instant.now();
        var expiresIn = 1800L;

        var role = user.get().getRole().getName().name();

        var scopes = role;

        var claims = JwtClaimsSet.builder()
                .issuer("nergal.com")
                .subject(user.get().getUserId().toString())
                .expiresAt(now.plusSeconds(expiresIn))
                .claim("scope", scopes)
                .issuedAt(now)
                .build();

        var jwtValue = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

        auditLogService.saveLog(user.get(), "LOGIN", "USER", user.get().getUserId(), "User logged in successfully",
                null);

        return new LoginResponse(jwtValue, expiresIn);
    }

    @Transactional(readOnly = true)
    public UserContentResponse listUsers(
            Pageable pageable,
            String name,
            String town,
            String role,
            JwtAuthenticationToken token) {

        var userRole = getUser(token).getRole().getName();

        if (userRole.equals(Role.Values.manager)) {
            town = getUser(token).getTown().getName();
        }

        var users = userRepository.findAll(UserV2Specifications.withFilters(town, name, role), pageable)
                .map(user -> new UserItemDTO(
                        user.getUserId(),
                        user.getUsername(),
                        user.getEmail(),
                        new RoleItemDTO(
                                user.getRole().getRoleId(),
                                user.getRole().getName()),
                        user.getTown() != null ? new TownItemDTO(
                                user.getTown().getTownId(),
                                user.getTown().getName(),
                                user.getTown().getUf(),
                                user.getTown().getImageUrl(),
                                user.getTown().getUsers().size()) : null,
                        user.getCreatedAt()));

        return new UserContentResponse(
                PageMapper.toPageResponse(users));
    }

    @Transactional(readOnly = true)
    public UserItemDTO getMe(JwtAuthenticationToken token) {
        var user = getUser(token);

        return new UserItemDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                new RoleItemDTO(
                        user.getRole().getRoleId(),
                        user.getRole().getName()),
                !"admin".equals(user.getRole().getName().name())
                        ? new TownItemDTO(
                                user.getTown().getTownId(),
                                user.getTown().getName(),
                                user.getTown().getUf(),
                                user.getTown().getImageUrl(),
                                user.getTown().getUsers().size())
                        : null,
                user.getCreatedAt());
    }

    protected void applyUpdates(UserV2 entity, UserUpdateDTO dto) {
        if (dto.username() != null) {
            entity.setUsername(dto.username());
        }
        if (dto.email() != null) {
            entity.setEmail(dto.email());
        }
        if (dto.role() != null) {
            var newRole = roleRepository.findByName(dto.role())
                    .orElseThrow(() -> new NotFoundException("Role not found"));
            entity.setRole(newRole);
        }
        if (dto.password() != null && !dto.password().isEmpty()) {
            entity.setPassword(passwordEncoder.encode(dto.password()));
        }
        if (dto.townId() != null) {
            var town = townRepository.findByTownId(dto.townId())
                    .orElseThrow(() -> new NotFoundException("Town not found"));
            entity.setTown(town);
        }
    }

    @Transactional
    public void updateUser(UUID userId, UserUpdateDTO dto, JwtAuthenticationToken token) {
        var user = getUser(token);
        UUID townId = null;

        if (user.getRole().getName() != Role.Values.admin) {
            townId = user.getTown().getTownId();
        }

        var userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isAdmin = user.getRole().getName().name().equalsIgnoreCase(Role.Values.admin.name());
        boolean isManager = user.getRole().getName().name().equalsIgnoreCase(Role.Values.manager.name())
                && userToUpdate.getRole().getName() != Role.Values.admin
                && userToUpdate.getTown().getTownId().equals(townId);

        if (isAdmin || isManager || userToUpdate.getUserId().equals(UUID.fromString(token.getName()))) {
            applyUpdates(userToUpdate, dto);
            userRepository.save(userToUpdate);

            auditLogService.saveLog(user, "UPDATE_USER", "USER", userToUpdate.getUserId(),
                    "User updated: " + userToUpdate.getUsername(), null);
        } else {
            throw new ForbiddenException("You do not have permission to update this user.");
        }
    }

    @Transactional
    public void deleteUser(UUID userId, JwtAuthenticationToken token) {
        var user = getUser(token);
        UUID townId = null;

        if (user.getRole().getName() != Role.Values.admin) {
            townId = user.getTown().getTownId();
        }

        var userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isAdmin = user.getRole().getName().name().equalsIgnoreCase(Role.Values.admin.name());
        boolean isManager = user.getRole().getName().name().equalsIgnoreCase(Role.Values.manager.name())
                && userToDelete.getRole().getName() != Role.Values.admin
                && userToDelete.getTown().getTownId().equals(townId);

        if (isAdmin || isManager || userToDelete.getUserId().equals(UUID.fromString(token.getName()))) {
            userRepository.deleteById(userId);

            auditLogService.saveLog(user, "DELETE_USER", "USER", userId,
                    "User deleted: " + userToDelete.getUsername(), null);
        } else {
            throw new ForbiddenException("You do not have permission to delete this user.");
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest dto) {
        var user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new NotFoundException("User not found with this email"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(Instant.now().plusSeconds(3600)); // 1 hour

        userRepository.save(user);

        // TODO: Enviar e-mail com o token.
        // Exemplo: emailService.sendResetPasswordEmail(user.getEmail(), token);
        System.out.println("Reset token for " + user.getEmail() + ": " + token);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest dto) {
        var user = userRepository.findByResetToken(dto.token())
                .orElseThrow(() -> new UnprocessableContentException("Invalid or expired token"));

        if (user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw new UnprocessableContentException("Token expired");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        auditLogService.saveLog(user, "RESET_PASSWORD", "USER", user.getUserId(), "Password reset successfully", null);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest dto, JwtAuthenticationToken token) {
        var user = getUser(token);

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);

        auditLogService.saveLog(user, "CHANGE_PASSWORD", "USER", user.getUserId(), "Password changed successfully",
                null);
    }

    // Auxiliary methods
    private UserV2 getUser(JwtAuthenticationToken token) {
        return userRepository.findById(UUID.fromString(token.getName()))
                .orElseThrow(() -> new NotFoundException("user not found"));
    }
}
