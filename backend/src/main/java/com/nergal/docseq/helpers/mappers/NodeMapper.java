package com.nergal.docseq.helpers.mappers;

import com.nergal.docseq.dto.nodes.NodeResponseDTO;
import com.nergal.docseq.dto.nodes.NodeTreeResponseDTO;
import com.nergal.docseq.entities.Node;
import com.nergal.docseq.entities.NodeType;
import com.nergal.docseq.entities.NodeUserMetadata;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

public class NodeMapper {

    public static NodeResponseDTO toDTO(Node node, NodeUserMetadata metadata) {
        return new NodeResponseDTO(
                node.getNodeId(),
                node.getName(),
                node.getNodeType(),
                metadata != null ? metadata.getFavorite() : false,
                node.getParent() != null ? node.getParent().getNodeId() : null,
                node.getTown() != null ? node.getTown().getTownId() : null,
                node.getCreatedBy() != null ? node.getCreatedBy().getUserId() : null,
                node.getCreatedBy() != null ? node.getCreatedBy().getUsername() : null,
                node.getUpdatedBy() != null ? node.getUpdatedBy().getUserId() : null,
                node.getUpdatedBy() != null ? node.getUpdatedBy().getUsername() : null,
                node.getDeletedBy() != null ? node.getDeletedBy().getUserId() : null,
                node.getDeletedBy() != null ? node.getDeletedBy().getUsername() : null,
                node.getRestoredBy() != null ? node.getRestoredBy().getUserId() : null,
                node.getRestoredBy() != null ? node.getRestoredBy().getUsername() : null,
                node.getCreatedAt(),
                node.getUpdatedAt(),
                node.getDeletedAt(),
                node.getContentType(),
                node.getSize(),
                node.getObjectKey(),
                metadata != null ? metadata.getLastSeen() : null);
    }

    public static NodeResponseDTO toDTO(Node node) {
        return toDTO(node, null);
    }

    public static List<NodeTreeResponseDTO> buildNodeTree(List<Node> allNodes) {
        Map<UUID, NodeTreeResponseDTO> nodeMap = allNodes.stream()
                .filter(node -> node.getNodeType() == NodeType.folder)
                .collect(Collectors.toMap(
                        Node::getNodeId,
                        node -> new NodeTreeResponseDTO(node.getNodeId(), node.getName(),
                                new java.util.ArrayList<>())));

        List<NodeTreeResponseDTO> rootNodes = new java.util.ArrayList<>();

        for (Node node : allNodes) {
            if (node.getNodeType() == NodeType.folder) {
                NodeTreeResponseDTO nodeDTO = nodeMap.get(node.getNodeId());
                if (node.getParent() == null) {
                    rootNodes.add(nodeDTO);
                } else {
                    NodeTreeResponseDTO parentDTO = nodeMap.get(node.getParent().getNodeId());
                    if (parentDTO != null) {
                        parentDTO.children().add(nodeDTO);
                    } else {
                        // If parent is not in the list (no permission), treat as root
                        rootNodes.add(nodeDTO);
                    }
                }
            }
        }
        return rootNodes;
    }
}
