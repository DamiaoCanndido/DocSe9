package com.nergal.docseq.services;

import java.util.UUID;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.controllers.dto.PermissionRequestDTO;
import com.nergal.docseq.entities.UserPermission;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.repositories.PermissionRepository;
import com.nergal.docseq.repositories.UserRepository;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public PermissionService(PermissionRepository permissionRepository, UserRepository userRepository) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createPermission(PermissionRequestDTO dto, JwtAuthenticationToken token){
        var user = userRepository.findById(UUID.fromString(token.getName()));
        var permission = new UserPermission();

        var exists = permissionRepository.existsByNameAndUser_UserId(dto.name(), UUID.fromString(token.getName()));

        if (exists) {
            throw new ConflictException("permission already exists for user");
        }

        permission.setName(dto.name());
        permission.setUser(user.get());
        permissionRepository.save(permission);
    }
    
}
