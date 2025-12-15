package com.nergal.hello.controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.nergal.hello.controllers.dto.RegisterUserDTO;
import com.nergal.hello.entities.Role;
import com.nergal.hello.entities.User;
import com.nergal.hello.repositories.RoleRepository;
import com.nergal.hello.repositories.UserRepository;

import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(  UserRepository userRepository, 
                            RoleRepository roleRepository, 
                            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterUserDTO dto) {

        var basicRole = roleRepository.findByName(Role.Values.basic.name());

        var userExists = userRepository.findByUsername(dto.username());

        if (userExists.isPresent()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "User with given username already exists");
        }

        var user = new User();
        user.setUsername(dto.username());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRoles(Set.of(basicRole));

        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
    
}
