package com.nergal.docseq.services;

import com.nergal.docseq.dto.nodes.NodeContentResponse;
import com.nergal.docseq.dto.nodes.NodeRequestDTO;
import com.nergal.docseq.dto.nodes.NodeResponseDTO;
import com.nergal.docseq.dto.nodes.NodeTreeResponseDTO;
import com.nergal.docseq.dto.nodes.NodeUpdateDTO;
import com.nergal.docseq.dto.search.SearchV2ResponseDTO;
import com.nergal.docseq.entities.Node;
import com.nergal.docseq.entities.NodeType;
import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.UserV2;
import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.exception.ForbiddenException;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.helpers.mappers.NodeMapper;
import com.nergal.docseq.helpers.mappers.PageMapper;
import com.nergal.docseq.helpers.specifications.FolderV2Specifications;
import com.nergal.docseq.repositories.NodeRepository;
import com.nergal.docseq.repositories.UserV2Repository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NodeService {

    private final NodeRepository nodeRepository;
    private final UserV2Repository userV2Repository;
    private final StorageService storageService;
    private final PermissionV2Service permissionServiceV2;

    public NodeService(
            NodeRepository nodeRepository,
            UserV2Repository userV2Repository,
            StorageService storageService,
            PermissionV2Service permissionServiceV2) {
        this.nodeRepository = nodeRepository;
        this.userV2Repository = userV2Repository;
        this.storageService = storageService;
        this.permissionServiceV2 = permissionServiceV2;
    }

    @Transactional(readOnly = true)
    public NodeContentResponse listRootNodes(
            Pageable pageable,
            String name,
            JwtAuthenticationToken token) {
        UserV2 user = getUser(token);
        boolean isManager = user.getRole().getName().equals(Role.Values.manager);
        UUID townId = user.getTown().getTownId();

        var nodePage = nodeRepository
                .findAll(
                        FolderV2Specifications.withRootFilters(
                                townId, name, PermissionType.READ,
                                user.getUserId(), isManager)
                                .and(FolderV2Specifications.withEagerLoading()),
                        pageable)
                .map(NodeMapper::toDTO);

        return new NodeContentResponse(PageMapper.toPageResponse(nodePage));
    }

    @Transactional(readOnly = true)
    public NodeContentResponse listChildren(
            UUID parentId,
            String name,
            Pageable pageable,
            JwtAuthenticationToken token) {
        UserV2 user = getUser(token);
        boolean isManager = user.getRole().getName().equals(Role.Values.manager);
        UUID townId = user.getTown().getTownId();

        var node = nodeRepository.findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                parentId,
                townId,
                NodeType.folder)
                .orElseThrow(() -> new NotFoundException("Parent node not found"));

        isFile(node);

        var nodePage = nodeRepository
                .findAll(FolderV2Specifications.withSubFoldersFilters(
                        townId,
                        parentId,
                        name,
                        PermissionType.READ,
                        user.getUserId(),
                        isManager), pageable)
                .map(NodeMapper::toDTO);

        return new NodeContentResponse(PageMapper.toPageResponse(nodePage));
    }

    @Transactional(readOnly = true)
    public SearchV2ResponseDTO searchNodes(String name, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);
        boolean isManager = user.getRole().getName().equals(Role.Values.manager);
        UUID townId = user.getTown().getTownId();

        List<Node> nodes = nodeRepository.findAll(
                FolderV2Specifications.withNameSearch(
                        townId,
                        name,
                        PermissionType.READ,
                        user.getUserId(),
                        isManager)
                        .and(FolderV2Specifications.withEagerLoading()));

        List<NodeResponseDTO> folderDTOs = nodes.stream()
                .filter(node -> node.getNodeType() == NodeType.folder)
                .map(NodeMapper::toDTO)
                .collect(Collectors.toList());

        List<NodeResponseDTO> fileDTOs = nodes.stream()
                .filter(node -> node.getNodeType() == NodeType.file)
                .map(NodeMapper::toDTO)
                .collect(Collectors.toList());

        return new SearchV2ResponseDTO(folderDTOs, fileDTOs);
    }

    @Transactional(readOnly = true)
    public List<NodeTreeResponseDTO> getNodeTree(
            JwtAuthenticationToken token) {
        UserV2 user = getUser(token);
        if (user.getRole().getName().equals(Role.Values.basic)) {
            throw new ForbiddenException(
                    "Basic users cannot view the full node tree without explicit read permissions.");
        }
        UUID townId = user.getTown().getTownId();

        var nodes = nodeRepository
                .findByTownTownIdAndNodeTypeAndDeletedAtIsNull(townId, NodeType.folder)
                .stream()
                .collect(Collectors.toList());

        return NodeMapper.buildNodeTree(nodes);
    }

    @Transactional
    public void create(NodeRequestDTO dto, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node parent = null;
        if (dto.parentId() != null) {
            parent = nodeRepository.findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                    dto.parentId(),
                    user.getTown().getTownId(),
                    NodeType.folder)
                    .orElseThrow(() -> new NotFoundException("Parent node not found"));

            if (parent.getNodeType() != NodeType.folder) {
                throw new BadRequestException("Cannot create a node inside a file.");
            }

            if (!permissionServiceV2.checkPermission(dto.parentId(), PermissionType.WRITE, token)) {
                throw new ForbiddenException("You do not have write permission for the parent node.");
            }
        } else { // Creating a root node
            if (user.getRole().getName().equals(Role.Values.basic)) {
                throw new ForbiddenException("Basic users cannot create root nodes.");
            }
        }

        if (nodeRepository.existsByNameAndParentAndNodeTypeAndDeletedAtIsNull(dto.name(), parent, NodeType.folder)) {
            throw new ConflictException("Node with the same name and type already exists in this parent.");
        }

        Node node = new Node();
        node.setName(dto.name());
        node.setNodeType(NodeType.folder);
        node.setParent(parent);
        if (dto.parentId() != null) {
            node.copyPermissionsFrom(parent);
        }
        node.setTown(user.getTown());
        node.setCreatedBy(user);

        nodeRepository.save(node);
    }

    @Transactional
    public void update(
            UUID nodeId,
            NodeUpdateDTO dto,
            JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node node = nodeRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        nodeId,
                        user.getTown().getTownId(),
                        NodeType.folder)
                .orElseThrow(() -> new NotFoundException("Node not found"));

        isFile(node);

        if (!permissionServiceV2.checkPermission(nodeId, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for this node.");
        }

        if (dto.name() != null) {
            if (nodeRepository.existsByNameAndParentAndNodeTypeAndDeletedAtIsNull(dto.name(), node.getParent(),
                    node.getNodeType())) {
                throw new ConflictException("Node with the same name and type already exists in this parent.");
            }
            node.setName(dto.name());
        }
        if (dto.favorite() != null) {
            node.setFavorite(dto.favorite());
        }
        nodeRepository.save(node);
    }

    @Transactional
    public void move(UUID nodeId, UUID targetNodeId, JwtAuthenticationToken token) {
        UUID townId = getTownId(token);

        Node nodeToMove = nodeRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        nodeId, townId, NodeType.folder)
                .orElseThrow(() -> new NotFoundException("Node to move not found"));

        isFile(nodeToMove);

        Node targetNode = nodeRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        targetNodeId, townId, NodeType.folder)
                .orElseThrow(() -> new NotFoundException("Target node not found"));

        if (!permissionServiceV2.checkPermission(nodeId, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for the source node.");
        }
        if (!permissionServiceV2.checkPermission(targetNodeId, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission for the target node.");
        }

        if (nodeToMove.getNodeId().equals(targetNode.getNodeId())) {
            throw new BadRequestException("Node cannot be its own parent");
        }

        if (targetNode.getNodeType() != NodeType.folder) {
            throw new BadRequestException("Cannot move a node into a file.");
        }

        if (!nodeToMove.getTown().getTownId().equals(targetNode.getTown().getTownId())) {
            throw new ForbiddenException("Different organizations");
        }

        if (nodeToMove.getDeletedAt() != null || targetNode.getDeletedAt() != null) {
            throw new BadRequestException("Cannot move deleted nodes");
        }

        if (isDescendant(nodeToMove, targetNode)) {
            throw new BadRequestException("Cannot move node into its own subtree");
        }

        nodeToMove.setParent(targetNode);
        nodeToMove.setUpdatedBy(getUser(token)); // Using getUser(token) directly
        nodeRepository.save(nodeToMove);
    }

    private boolean isDescendant(Node source, Node target) {
        Node current = target.getParent();

        while (current != null) {
            if (current.getNodeId().equals(source.getNodeId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    @Transactional
    public void softDelete(UUID nodeId, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node node = nodeRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        nodeId,
                        user.getTown().getTownId(),
                        NodeType.folder)
                .orElseThrow(() -> new NotFoundException("Node not found"));

        isFile(node);

        if (!permissionServiceV2.checkPermission(nodeId, PermissionType.DELETE, token)) {
            throw new ForbiddenException("You do not have delete permission for this node.");
        }

        softDeleteRecursively(node, user);
    }

    @Transactional
    public void softDeleteRecursively(Node root, UserV2 deletedBy) {
        Instant now = Instant.now();

        List<Node> allNodesInTown = nodeRepository.findByTownTownIdAndNodeTypeAndDeletedAtIsNull(
                root.getTown().getTownId(), NodeType.folder);
        Map<UUID, List<Node>> parentToChildrenMap = allNodesInTown.stream()
                .filter(n -> n.getParent() != null)
                .collect(Collectors.groupingBy(n -> n.getParent().getNodeId()));

        List<Node> nodesToDelete = new ArrayList<>();
        Queue<Node> queue = new LinkedList<>();

        if (root.getDeletedAt() == null) {
            queue.add(root);
            nodesToDelete.add(root);
        }

        while (!queue.isEmpty()) {
            Node current = queue.poll();
            List<Node> children = parentToChildrenMap.getOrDefault(current.getNodeId(), Collections.emptyList());
            for (Node child : children) {
                if (child.getDeletedAt() == null) {
                    nodesToDelete.add(child);
                    queue.add(child);
                }
            }
        }

        for (Node node : nodesToDelete) {
            node.setDeletedAt(now);
            node.setDeletedBy(deletedBy);
            // If it's a file, mark its object for deletion in storage service eventually
        }
        nodeRepository.saveAll(nodesToDelete);
    }

    @Transactional
    public void permanentDelete(UUID nodeId, JwtAuthenticationToken token) {
        UUID townId = getTownId(token);

        Node node = nodeRepository.findByNodeIdAndTownTownIdAndDeletedAtIsNotNull(
                nodeId, townId)
                .orElseThrow(() -> new NotFoundException("Node not found"));

        isFile(node);

        if (node.getDeletedAt() == null) {
            throw new BadRequestException("Node must be in trash before permanent delete");
        }

        if (!permissionServiceV2.checkPermission(nodeId, PermissionType.DELETE, token)) {
            throw new ForbiddenException("You do not have delete permission to permanently delete this node.");
        }

        permanentDeleteRecursively(node);
    }

    @Transactional
    public void permanentDeleteRecursively(Node root) {
        List<Node> allNodesInTown = nodeRepository.findByTownTownId(root.getTown().getTownId());
        Map<UUID, List<Node>> parentToChildrenMap = allNodesInTown.stream()
                .filter(n -> n.getParent() != null)
                .collect(Collectors.groupingBy(n -> n.getParent().getNodeId()));

        List<Node> nodesToDelete = new ArrayList<>();
        Queue<Node> queue = new LinkedList<>();

        queue.add(root);
        nodesToDelete.add(root);

        while (!queue.isEmpty()) {
            Node current = queue.poll();
            List<Node> children = parentToChildrenMap.getOrDefault(current.getNodeId(), Collections.emptyList());
            nodesToDelete.addAll(children);
            queue.addAll(children);
        }

        // Collect object keys of files before deleting nodes
        List<String> objectKeysToDelete = nodesToDelete.stream()
                .filter(node -> node.getNodeType() == NodeType.file && node.getObjectKey() != null)
                .map(Node::getObjectKey)
                .collect(Collectors.toList());

        nodeRepository.deleteAll(nodesToDelete);

        for (String objectKey : objectKeysToDelete) {
            try {
                storageService.delete(objectKey);
            } catch (Exception e) {
                log.error("Failed to delete file from storage: {}", e.getMessage());
            }
        }
    }

    @Transactional(readOnly = true)
    public NodeContentResponse listTrash(
            Pageable pageable,
            JwtAuthenticationToken token) {
        UUID townId = getTownId(token);
        UserV2 user = getUser(token);

        List<PermissionType> permissions = new ArrayList<>(Arrays.asList(
                PermissionType.READ,
                PermissionType.WRITE,
                PermissionType.SHARE,
                PermissionType.DELETE));

        var nodePage = nodeRepository
                .findTrashByTownAndPermissions(
                        townId,
                        user.getUserId(),
                        user.getRole().getName().name(),
                        permissions,
                        pageable)
                .map(NodeMapper::toDTO);

        return new NodeContentResponse(PageMapper.toPageResponse(nodePage));
    }

    @Transactional
    public void restore(UUID nodeId, JwtAuthenticationToken token) {
        UUID townId = getTownId(token);

        Node node = nodeRepository
                .findByNodeIdAndTownTownIdAndDeletedAtIsNotNull(
                        nodeId, townId)
                .orElseThrow(() -> new NotFoundException("Node not found"));

        isFile(node);

        if (!permissionServiceV2.checkPermission(nodeId, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to restore this node.");
        }

        restoreRecursively(node);
    }

    @Transactional
    public void restoreRecursively(Node root) {
        List<Node> allDeletedNodesInTown = nodeRepository
                .findByTownTownIdAndDeletedAtIsNotNull(root.getTown().getTownId(), Pageable.unpaged()).getContent();
        Map<UUID, List<Node>> parentToChildrenMap = allDeletedNodesInTown.stream()
                .filter(n -> n.getParent() != null)
                .collect(Collectors.groupingBy(n -> n.getParent().getNodeId()));

        List<Node> nodesToRestore = new ArrayList<>();
        Queue<Node> queue = new LinkedList<>();

        if (root.getDeletedAt() != null) {
            queue.add(root);
            nodesToRestore.add(root);
        }

        while (!queue.isEmpty()) {
            Node current = queue.poll();
            List<Node> children = parentToChildrenMap.getOrDefault(current.getNodeId(), Collections.emptyList());
            for (Node child : children) {
                if (child.getDeletedAt() != null) {
                    nodesToRestore.add(child);
                    queue.add(child);
                }
            }
        }

        for (Node node : nodesToRestore) {
            node.setDeletedAt(null);
            node.setDeletedBy(null);
        }
        nodeRepository.saveAll(nodesToRestore);
    }

    @Transactional
    public void toggleFavorite(UUID nodeId, JwtAuthenticationToken token) {
        UserV2 user = getUser(token);

        Node node = nodeRepository
                .findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        nodeId,
                        user.getTown().getTownId(),
                        NodeType.folder)
                .orElseThrow(() -> new NotFoundException("Node not found"));

        isFile(node);

        if (!permissionServiceV2.checkPermission(nodeId, PermissionType.WRITE, token)) {
            throw new ForbiddenException("You do not have write permission to favorite/unfavorite this node.");
        }

        node.setFavorite(!node.getFavorite());
        nodeRepository.save(node);
    }

    private UserV2 getUser(JwtAuthenticationToken token) {
        return userV2Repository.findById(UUID.fromString(token.getName()))
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private UUID getTownId(JwtAuthenticationToken token) {
        return getUser(token).getTown().getTownId();
    }

    private void isFile(Node node) {
        if (node.getNodeType().equals(NodeType.file)) {
            throw new BadRequestException("its a file node.");
        }
    }
}
