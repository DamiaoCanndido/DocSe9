package com.nergal.docseq.repositories;

import com.nergal.docseq.entities.Node;
import com.nergal.docseq.entities.NodeType;
import com.nergal.docseq.entities.PermissionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NodeRepository extends JpaRepository<Node, UUID>, JpaSpecificationExecutor<Node> {

    // Recycle Bin – List deleted nodes (folders or files)
    Page<Node> findByTownTownIdAndDeletedAtIsNotNull(UUID townId, Pageable page);

    @Query("""
            SELECT DISTINCT n FROM Node n
            LEFT JOIN n.permissions p
            LEFT JOIN n.parent parent
            LEFT JOIN p.user u
            WHERE n.town.townId = :townId
            AND n.deletedAt IS NOT NULL
            AND (n.parent IS NULL OR n.parent.deletedAt IS NULL)
            AND (
                :userRole IN ('manager')
                OR (
                    u.userId = :userId
                    AND p.permissionType IN :acceptablePermissions
                )
            )
            """)
    Page<Node> findTrashByTownAndPermissions(
            @Param("townId") UUID townId,
            @Param("userId") UUID userId,
            @Param("userRole") String userRole,
            @Param("acceptablePermissions") List<PermissionType> acceptablePermissions,
            Pageable pageable);

    // Check for duplicate names in the same folder
    boolean existsByNameAndParentAndNodeTypeAndDeletedAtIsNull(String name, Node parent, NodeType nodeType);

    // Search for "restore" in the trash can.
    Optional<Node> findByNodeIdAndTownTownIdAndDeletedAtIsNotNull(UUID nodeId, UUID townId);

    List<Node> findByTownTownId(UUID townId);

    List<Node> findByParent(Node parent);

    // QUERY RECURSIVA PARA BUSCAR TODAS AS SUBPASTAS
    @Query(value = """
            WITH RECURSIVE subnode_tree AS (
                SELECT node_id, parent_id, name, node_type, town_id, favorite,
                       created_by, updated_by, deleted_by, created_at, updated_at, deleted_at,
                       content_type, size, object_key, last_seen
                FROM tb_nodes
                WHERE node_id = :nodeId AND node_type = 'folder'

                UNION ALL

                SELECT n.node_id, n.parent_id, n.name, n.node_type, n.town_id, n.favorite,
                       n.created_by, n.updated_by, n.deleted_by, n.created_at, n.updated_at, n.deleted_at,
                       n.content_type, n.size, n.object_key, n.last_seen
                FROM tb_nodes n
                INNER JOIN subnode_tree st ON n.parent_id = st.node_id
            )
            SELECT * FROM subnode_tree WHERE node_id != :nodeId AND deleted_at IS NULL
            """, nativeQuery = true)
    List<Node> findAllChildNodesRecursive(@Param("nodeId") UUID nodeId);

    // QUERY RECURSIVA PARA BUSCAR TODAS AS PASTAS PAI (até a raiz)
    @Query(value = """
            WITH RECURSIVE parent_tree AS (
                SELECT node_id, parent_id, name, node_type, town_id, favorite,
                       created_by, updated_by, deleted_by, created_at, updated_at, deleted_at,
                       content_type, size, object_key, last_seen
                FROM tb_nodes
                WHERE node_id = :nodeId AND node_type = 'folder'

                UNION ALL

                SELECT n.node_id, n.parent_id, n.name, n.node_type, n.town_id, n.favorite,
                       n.created_by, n.updated_by, n.deleted_by, n.created_at, n.updated_at, n.deleted_at,
                       n.content_type, n.size, n.object_key, n.last_seen
                FROM tb_nodes n
                INNER JOIN parent_tree pt ON n.node_id = pt.parent_id
            )
            SELECT * FROM parent_tree WHERE node_id != :nodeId AND deleted_at IS NULL
            """, nativeQuery = true)
    List<Node> findAllParentNodesRecursive(@Param("nodeId") UUID nodeId);

    // Find children by node type
    List<Node> findByParentAndNodeTypeAndDeletedAtIsNull(Node parent, NodeType nodeType);

    // OPCIONAL: Buscar com permissões já carregadas
    @Query("SELECT n FROM Node n LEFT JOIN FETCH n.permissions WHERE n.parent = :parent AND n.deletedAt IS NULL")
    List<Node> findByParentWithPermissions(@Param("parent") Node parent);

    Optional<Node> findByNodeIdAndNodeType(UUID nodeId, NodeType nodeType);

    Optional<Node> findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(UUID nodeId, UUID townId, NodeType nodeType);

    Optional<Node> findByNodeIdAndTownTownIdAndDeletedAtIsNull(UUID nodeId, UUID townId);

    // List nodes by parent and town, order by nodeType then name
    List<Node> findByParentAndTownTownIdAndDeletedAtIsNullOrderByNodeTypeDescNameAsc(Node parent, UUID townId);

    // Find all nodes that are files (node_type = 'FILE') within a town and not
    // deleted
    List<Node> findByTownTownIdAndNodeTypeAndDeletedAtIsNull(UUID townId, NodeType nodeType);
}
