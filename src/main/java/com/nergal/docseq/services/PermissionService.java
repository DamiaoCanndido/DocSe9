package com.nergal.docseq.services;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.controllers.dto.PermissionDTO;
import com.nergal.docseq.controllers.dto.PermissionItemDTO;
import com.nergal.docseq.controllers.dto.PermissionRequestDTO;
import com.nergal.docseq.entities.PermissionEnum;
import com.nergal.docseq.entities.UserPermission;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.exception.NotFoundException;
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

    @Transactional(readOnly = true)
    public PermissionDTO getPermissionsByUserId(
        int page,
        int pageSize,
        UUID userId
    ){
        var pageble = PageRequest.of(page, pageSize, Sort.Direction.ASC, "name");
        var permissions = permissionRepository.findByUser_UserId(userId, pageble);
        if (permissions.isEmpty()) {
            throw new NotFoundException("no permissions found for user");
        }

        var permissionItem = permissions.stream()
            .map(permission -> new PermissionItemDTO(
                permission.getPermissionId(),
                permission.getName()
            ))
            .toList();

        return new PermissionDTO(
            permissionItem,
            page,
            pageSize,
            permissions.getTotalPages(),
            permissions.getTotalElements()
        );
    }

    @Transactional
    public void createPermission(PermissionRequestDTO dto){
        var user = userRepository.findById(UUID.fromString(dto.userId()));
        var permission = new UserPermission();

        var existsPermission = permissionRepository.existsByNameAndUser_UserId(dto.name(), UUID.fromString(dto.userId()));

        if (user.isEmpty()) {
            throw new NotFoundException("user not found");
        }

        if (existsPermission) {
            throw new ConflictException("permission already exists for user");
        }

        permission.setName(dto.name());
        permission.setUser(user.get());
        permissionRepository.save(permission);
    }

    @Transactional
    public void deletePermission(UUID userId, PermissionEnum permissionName){
        var user = userRepository.findById(userId);

        if (user.isEmpty()) {
            throw new NotFoundException("user not found");
        }

        permissionRepository.deleteByUser_UserIdAndName(userId, permissionName);
    }
    
}
