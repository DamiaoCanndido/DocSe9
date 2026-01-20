package com.nergal.docseq.services;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import com.nergal.docseq.dto.roles.RoleItemDTO;
import com.nergal.docseq.dto.towns.TownItemDTO;
import com.nergal.docseq.dto.users.LoginRequest;
import com.nergal.docseq.dto.users.LoginResponse;
import com.nergal.docseq.dto.users.RegisterUserDTO;
import com.nergal.docseq.dto.users.UserDTO;
import com.nergal.docseq.dto.users.UserItemDTO;
import com.nergal.docseq.dto.users.UserUpdateDTO;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.Town;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.exception.UnprocessableContentException;
import com.nergal.docseq.repositories.PermissionRepository;
import com.nergal.docseq.repositories.RoleRepository;
import com.nergal.docseq.repositories.TownRepository;
import com.nergal.docseq.repositories.UserRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TownRepository townRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            TownRepository townRepository,
            PermissionRepository permissionRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.townRepository = townRepository;
        this.permissionRepository = permissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    @Transactional
    public void register(RegisterUserDTO dto) {

        if (userRepository.findByEmail(dto.email()).isPresent() || 
            userRepository.findByUsername(dto.username()).isPresent()) {
            throw new UnprocessableContentException("user already exists");
        }

        var basicRole = roleRepository.findByName(Role.Values.basic);

        Town town = null;

        if (dto.townId() != null) {
            town = townRepository.findByTownId(dto.townId()).orElseThrow(
                () -> new NotFoundException("Town not found")
            );    
        }

        var user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRoles(Set.of(basicRole));
        user.setTown(town);

        userRepository.save(user);
    }

    @Transactional
    public LoginResponse login(LoginRequest loginRequest){
        var user = userRepository.findByEmail(loginRequest.email());

        if (user.isEmpty() || !user.get().isLoginCorrect(loginRequest, passwordEncoder)) {
            throw new BadCredentialsException("user or password invalid");
        }

        var permissionsByUser = permissionRepository.findPermissionNamesByUsername(user.get().getUsername());

        var now = Instant.now();
        var expiresIn = 300L;

        var role = user.get().getRoles()
            .stream()
            .map(Role::getName)
            .map(Role.Values::name)
            .collect(Collectors.joining(" "));
        
        
        var scopes = String.join(" ", role, String.join(" ", permissionsByUser));


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
    public UserDTO listUsers(int page, int pageSize){
        var users = userRepository.findAll(PageRequest.of(page, pageSize, Sort.Direction.ASC, "username"))   
            .map(user -> 
                new UserItemDTO(
                    user.getUserId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRoles()
                        .stream()
                        .map(role -> new RoleItemDTO(
                            role.getRoleId(), 
                            role.getName()
                        )).collect(Collectors.toList()),
                    user.getTown() != null ? new TownItemDTO(
                        user.getTown().getTownId(),
                        user.getTown().getName(),
                        user.getTown().getUf(),
                        user.getTown().getImageUrl()
                    ) : null,
                    user.getCreatedAt()
                ));

        return new UserDTO(
            users.getContent(),
            page,
            pageSize,
            users.getTotalPages(),
            users.getTotalElements()
        );
    }

    protected void applyUpdates(User entity, UserUpdateDTO dto) {
        if (dto.username() != null) {
            entity.setUsername(dto.username());
        }
        if (dto.email() != null) {
            entity.setEmail(dto.email());
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
    public void updateUser(UUID userId, UserUpdateDTO dto){
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        applyUpdates(user, dto);

        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId, JwtAuthenticationToken token){
        var user = userRepository.findById(UUID.fromString(token.getName()));

        var isAdmin = user.get().getRoles()
            .stream()
            .anyMatch(role -> role.getName().name().equalsIgnoreCase(Role.Values.admin.name()));

        var userToDelete = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        if (isAdmin || userToDelete.getUserId().equals(UUID.fromString(token.getName()))) {
            userRepository.deleteById(userId);
        } else {
            throw new ForbiddenException("You do not have permission to delete this user.");
        }
    }
}
