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

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TownRepository townRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            TownRepository townRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.townRepository = townRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
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

        Town town = null;

        // Conditional validation for townId based on the actual userRole
        if (userRole.getName() != Role.Values.admin && dto.townId() == null) {
            throw new UnprocessableContentException("Town must be provided for basic and manager users");
        }
        if (userRole.getName() == Role.Values.admin && dto.townId() != null) {
            throw new UnprocessableContentException("admins cannot be created with a town");
        }

        final User currentUser = getUser(token);

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

        var user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRole(userRole);
        user.setTown(town);

        userRepository.save(user);
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

        return new LoginResponse(jwtValue, expiresIn);
    }

    @Transactional(readOnly = true)
    public UserContentResponse listUsers(Pageable pageable) {
        var users = userRepository.findAll(pageable)
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
                                user.getTown().getImageUrl()) : null,
                        user.getCreatedAt()));

        return new UserContentResponse(
                PageMapper.toPageResponse(users));
    }

    @Transactional(readOnly = true)
    public UserItemDTO getMe(JwtAuthenticationToken token) {
        var user = userRepository.findById(UUID.fromString(token.getName()))
                .orElseThrow(() -> new NotFoundException("user not found"));
        return new UserItemDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                new RoleItemDTO(
                        user.getRole().getRoleId(),
                        user.getRole().getName()),
                user.getRole().getName().name() != "admin"
                        ? new TownItemDTO(
                                user.getTown().getTownId(),
                                user.getTown().getName(),
                                user.getTown().getUf(),
                                user.getTown().getImageUrl())
                        : null,
                user.getCreatedAt());
    }

    protected void applyUpdates(User entity, UserUpdateDTO dto) {
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
    public void updateUser(UUID userId, UserUpdateDTO dto) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        applyUpdates(user, dto);

        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId, JwtAuthenticationToken token) {
        var user = userRepository.findById(UUID.fromString(token.getName()));

        var isAdmin = user.get().getRole().getName().name().equalsIgnoreCase(Role.Values.admin.name());

        var userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (isAdmin || userToDelete.getUserId().equals(UUID.fromString(token.getName()))) {
            userRepository.deleteById(userId);
        } else {
            throw new ForbiddenException("You do not have permission to delete this user.");
        }
    }

    // Auxiliary methods
    private User getUser(JwtAuthenticationToken token) {
        return userRepository.findById(UUID.fromString(token.getName()))
                .orElseThrow(() -> new NotFoundException("user not found"));
    }
}
