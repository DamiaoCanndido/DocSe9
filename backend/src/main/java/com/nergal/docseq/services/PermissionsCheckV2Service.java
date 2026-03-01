package com.nergal.docseq.services;

import com.nergal.docseq.entities.Node;
import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.UserV2;
import com.nergal.docseq.repositories.PermissionV2Repository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PermissionsCheckV2Service {

    private final PermissionV2Repository permissionRepository;

    public PermissionsCheckV2Service(PermissionV2Repository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    public boolean hasPermission(UUID userId, UUID nodeId, PermissionType required) {
        List<PermissionType> acceptablePermissions = Arrays.stream(PermissionType.values())
                .filter(p -> p.implies(required))
                .collect(Collectors.toList());

        return permissionRepository.existsByUserUserIdAndNodeNodeIdAndPermissionTypeIn(
                userId, nodeId, acceptablePermissions);
    }

    public boolean hasPermission(UserV2 user, Node node, PermissionType required) {
        return node.getPermissions().stream()
                .filter(p -> p.getUser().equals(user))
                .anyMatch(p -> p.getPermissionType().implies(required));
    }

    public boolean canRead(UserV2 user, Node node) {
        return hasPermission(user, node, PermissionType.READ);
    }

    public boolean canWrite(UserV2 user, Node node) {
        return hasPermission(user, node, PermissionType.WRITE);
    }

    public boolean canDelete(UserV2 user, Node node) {
        return hasPermission(user, node, PermissionType.DELETE);
    }
}
