package com.nergal.docseq.services;

import com.nergal.docseq.dto.permissions.PermissionRequestDTO;
import com.nergal.docseq.dto.permissions.PermissionResponseDTO;
import com.nergal.docseq.entities.*;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.repositories.NodeRepository;
import com.nergal.docseq.repositories.PermissionV2Repository;
import com.nergal.docseq.repositories.UserV2Repository;
import com.nergal.docseq.helpers.specifications.PermissionV2Specifications; // Assuming this will be created or handled

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PermissionV2Service {

    private final PermissionV2Repository permissionV2Repository;
    private final UserV2Repository userV2Repository;
    private final NodeRepository nodeRepository;
    private final PermissionsCheckV2Service permissionsCheckV2Service;

    public PermissionV2Service(PermissionV2Repository permissionV2Repository,
            UserV2Repository userV2Repository,
            NodeRepository nodeRepository,
            PermissionsCheckV2Service permissionsCheckV2Service) {
        this.permissionV2Repository = permissionV2Repository;
        this.userV2Repository = userV2Repository;
        this.nodeRepository = nodeRepository;
        this.permissionsCheckV2Service = permissionsCheckV2Service;
    }

    @Transactional
    public PermissionResponseDTO grantPermission(PermissionRequestDTO dto, JwtAuthenticationToken token) {
        UserV2 managerUser = getUser(token);
        validateManagerUser(managerUser);

        UserV2 targetUser = userV2Repository.findById(dto.userId())
                .orElseThrow(() -> new NotFoundException("Target user not found"));
        validateBasicUser(targetUser);
        validateSameTown(managerUser, targetUser);

        Node node = nodeRepository
                .findByNodeIdAndTownTownIdAndDeletedAtIsNull(dto.nodeId(), managerUser.getTown().getTownId())
                .orElseThrow(() -> new NotFoundException("Node not found or does not belong to your town"));

        boolean permissionExists = permissionV2Repository.findByUserUserIdAndNodeNodeIdAndPermissionType(
                targetUser.getUserId(), node.getNodeId(), dto.permissionType()).isPresent();

        if (permissionExists) {
            throw new ConflictException("Permission already exists for this user and resource.");
        }

        // 1. Adiciona no node atual
        var result = addOrUpdatePermission(node, targetUser, managerUser, dto.permissionType());

        // 3. Propaga para BAIXO (subpastas/subarquivos)
        // Only propagate if the node is a folder
        if (node.getNodeType() == NodeType.folder) {
            List<Node> childNodes = nodeRepository.findAllChildNodesRecursive(node.getNodeId());
            for (Node childNode : childNodes) {
                addOrUpdatePermission(childNode, targetUser, managerUser, dto.permissionType());
            }
        }

        return result;
    }

    @Transactional
    public void revokePermission(UUID permissionId, JwtAuthenticationToken token) {
        UserV2 managerUser = getUser(token);
        validateManagerUser(managerUser);

        PermissionV2 permission = permissionV2Repository.findById(permissionId)
                .orElseThrow(() -> new NotFoundException("Permission not found"));

        if (!permission.getGrantedBy().getUserId().equals(managerUser.getUserId())) {
            throw new ForbiddenException("You are not authorized to revoke this permission.");
        }

        Node node = permission.getNode(); // Get the node from the permission

        removePermission(node, permission.getUser().getUserId());

        // Remove das subpastas/subarquivos
        if (node.getNodeType() == NodeType.folder) {
            List<Node> childNodes = nodeRepository.findAllChildNodesRecursive(node.getNodeId());
            for (Node childNode : childNodes) {
                removePermission(childNode, permission.getUser().getUserId());
            }
        }

        permissionV2Repository.delete(permission);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponseDTO> listPermissions(UUID targetUserId, JwtAuthenticationToken token) {
        UserV2 currentUser = getUser(token);
        List<PermissionV2> permissions;
        Specification<PermissionV2> spec; // Placeholder for future

        if (currentUser.getRole().getName().equals(Role.Values.admin)) {
            if (targetUserId != null) {
                // Admin seeking permissions for a specific user.
                spec = PermissionV2Specifications.withEagerLoading()
                        .and(PermissionV2Specifications.byUserId(targetUserId));

                permissions = permissionV2Repository.findAll(spec);
            } else {
                // Admin seeking all permissions
                spec = PermissionV2Specifications.withEagerLoading();

                permissions = permissionV2Repository.findAll(spec);
            }
        } else if (currentUser.getRole().getName().equals(Role.Values.manager)) {
            // Managers can only list permissions they granted or for basic users in their
            // town
            if (targetUserId != null) {
                UserV2 targetUser = userV2Repository.findById(targetUserId)
                        .orElseThrow(() -> new NotFoundException("Target user not found"));
                validateBasicUser(targetUser);
                validateSameTown(currentUser, targetUser);

                // Manager searching for permissions for a specific user.
                spec = PermissionV2Specifications.withEagerLoading()
                        .and(PermissionV2Specifications.byUserId(targetUserId));

                permissions = permissionV2Repository.findAll(spec);
            } else {
                // List all permissions granted by this manager
                spec = PermissionV2Specifications.withEagerLoading()
                        .and(PermissionV2Specifications.byGrantedByUserId(currentUser.getUserId()));

                permissions = permissionV2Repository.findAll(spec);
            }
        } else {
            // Basic users can only list their own permissions
            if (targetUserId != null && !targetUserId.equals(currentUser.getUserId())) {
                throw new ForbiddenException("Basic users can only view their own permissions.");
            }

            // Basic user seeking their own permissions.
            spec = PermissionV2Specifications.withEagerLoading()
                    .and(PermissionV2Specifications.byUserId(currentUser.getUserId()));

            permissions = permissionV2Repository.findAll(spec);
        }

        return permissions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean checkPermission(UUID nodeId, PermissionType type,
            JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        if (user.getRole().getName().equals(Role.Values.admin)) {
            return true;
        }

        if (user.getRole().getName().equals(Role.Values.manager)) {
            Node node = nodeRepository.findById(nodeId)
                    .orElse(null);
            if (node != null && node.getTown().getTownId().equals(user.getTown().getTownId())) {
                return true;
            }
        }

        return permissionsCheckV2Service.hasPermission(
                user.getUserId(), nodeId, type);
    }

    // ==================== MÉTODOS AUXILIARES ====================

    private PermissionResponseDTO addOrUpdatePermission(Node node, UserV2 user, UserV2 grantedBy,
            PermissionType permissionType) {
        Optional<PermissionV2> existingPermission = node.getPermissions().stream()
                .filter(p -> p.getUser().getUserId().equals(user.getUserId()))
                .findFirst();

        PermissionV2 newPermission = new PermissionV2();

        if (existingPermission.isPresent()) {
            existingPermission.get().setPermissionType(permissionType);
            // Need to persist the change to existing permission, but since it's an entity
            // within 'node',
            // and node is managed, changes might be flushed automatically. Explicit save
            // for clarity/safety.
            permissionV2Repository.save(existingPermission.get());

            return new PermissionResponseDTO(
                    existingPermission.get().getPermissionId(),
                    user.getUserId(),
                    user.getUsername(),
                    node != null ? node.getNodeId() : null,
                    node.getName(),
                    existingPermission.get().getPermissionType(),
                    grantedBy.getUserId(),
                    grantedBy.getUsername(),
                    existingPermission.get().getCreatedAt());
        } else {
            newPermission.setNode(node);
            newPermission.setUser(user);
            newPermission.setGrantedBy(grantedBy);
            newPermission.setPermissionType(permissionType);
            node.getPermissions().add(newPermission);
            // Persist the new permission, which also updates the node's permissions
            // collection
            permissionV2Repository.save(newPermission);
        }

        // nodeRepository.save(node); // Not strictly needed if permissions are
        // cascaded, but can be explicit if needed

        return new PermissionResponseDTO(
                newPermission.getPermissionId(),
                user.getUserId(),
                user.getUsername(),
                node != null ? node.getNodeId() : null,
                node.getName(),
                newPermission.getPermissionType(),
                grantedBy.getUserId(),
                grantedBy.getUsername(),
                newPermission.getCreatedAt());
    }

    private void removePermission(Node node, UUID userId) {
        node.getPermissions().removeIf(p -> p.getUser().getUserId().equals(userId));
        nodeRepository.save(node); // Save the node to reflect permission removal
    }

    private UserV2 getUser(JwtAuthenticationToken token) {
        return userV2Repository.findById(UUID.fromString(token.getName()))
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private void validateManagerUser(UserV2 user) {
        if (!user.getRole().getName().equals(Role.Values.manager)) {
            throw new ForbiddenException("Only manager users can grant or revoke permissions.");
        }
    }

    private void validateBasicUser(UserV2 user) {
        if (!user.getRole().getName().equals(Role.Values.basic)) {
            throw new BadRequestException("Permissions can only be granted to basic users.");
        }
    }

    private void validateSameTown(UserV2 manager, UserV2 target) {
        if (!manager.getTown().getTownId().equals(target.getTown().getTownId())) {
            throw new ForbiddenException("Manager can only grant permissions to users within their own town.");
        }
    }

    private PermissionResponseDTO mapToResponseDTO(PermissionV2 permission) {
        return new PermissionResponseDTO(
                permission.getPermissionId(),
                permission.getUser().getUserId(),
                permission.getUser().getUsername(),
                permission.getNode() != null ? permission.getNode().getNodeId() : null,
                permission.getNode() != null ? permission.getNode().getName() : null,
                permission.getPermissionType(),
                permission.getGrantedBy().getUserId(),
                permission.getGrantedBy().getUsername(),
                permission.getCreatedAt());
    }
}
