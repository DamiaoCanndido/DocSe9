package com.nergal.hello.services;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nergal.hello.controllers.dto.LoginRequest;
import com.nergal.hello.controllers.dto.LoginResponse;
import com.nergal.hello.controllers.dto.RegisterUserDTO;
import com.nergal.hello.controllers.dto.RoleItemDTO;
import com.nergal.hello.controllers.dto.UserDTO;
import com.nergal.hello.controllers.dto.UserItemDTO;
import com.nergal.hello.entities.Role;
import com.nergal.hello.entities.Township;
import com.nergal.hello.entities.User;
import com.nergal.hello.exception.NotFoundException;
import com.nergal.hello.exception.UnprocessableContentException;
import com.nergal.hello.repositories.RoleRepository;
import com.nergal.hello.repositories.TownshipRepository;
import com.nergal.hello.repositories.UserRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TownshipRepository townshipRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            TownshipRepository townshipRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.townshipRepository = townshipRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    @Transactional
    public void register(RegisterUserDTO dto) {

        if (userRepository.findByEmail(dto.email()).isPresent() || 
            userRepository.findByUsername(dto.username()).isPresent()) {
            throw new UnprocessableContentException("user already exists");
        }

        var basicRole = roleRepository.findByName(Role.Values.basic.name());

        Township township = null;

        if (dto.townshipId() != null) {
            township = townshipRepository.findByTownshipId(dto.townshipId()).get();    
        }

        var user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRoles(Set.of(basicRole));
        user.setTownship(township);

        userRepository.save(user);
    }

    @Transactional
    public LoginResponse login(LoginRequest loginRequest){
        var user = userRepository.findByEmail(loginRequest.email());

        if (user.isEmpty() || !user.get().isLoginCorrect(loginRequest, passwordEncoder)) {
            throw new BadCredentialsException("user or password invalid");
        }

        var now = Instant.now();
        var expiresIn = 300L;

        var scopes = user.get().getRoles()
            .stream()
            .map(Role::getName)
            .collect(Collectors.joining(" "));

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
    public UserDTO listUsers() {
        var users = userRepository.findAll()
            .stream()   
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
                        ))
                        .collect(Collectors.toList()),
                    user.getCreatedAt()
                ));
        return new UserDTO(users.collect(Collectors.toList()));
    }

    @Transactional
    public void deleteUser(UUID userId, JwtAuthenticationToken token){
        var user = userRepository.findById(UUID.fromString(token.getName()));

        var isAdmin = user.get().getRoles()
            .stream()
            .anyMatch(role -> role.getName().equalsIgnoreCase(Role.Values.admin.name()));

        var userToDelete = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        if (isAdmin || userToDelete.getUserId().equals(UUID.fromString(token.getName()))) {
            userRepository.deleteById(userId);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }
}
