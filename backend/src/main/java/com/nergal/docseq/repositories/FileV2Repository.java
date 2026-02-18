package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Node;
import com.nergal.docseq.entities.NodeType;
import com.nergal.docseq.entities.PermissionType;

@Repository
public interface FileV2Repository extends JpaRepository<Node, UUID>, JpaSpecificationExecutor<Node> {

        // Search for files securely
        Optional<Node> findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNull(
                        UUID nodeId,
                        UUID townId,
                        NodeType nodeType);

        // Recycle Bin – Deleted Files
        Page<Node> findByTownTownIdAndNodeTypeAndDeletedAtIsNotNull(
                        UUID townId,
                        Pageable page,
                        NodeType nodeType);

        // Search for files soft deleted
        Optional<Node> findByNodeIdAndTownTownIdAndNodeTypeAndDeletedAtIsNotNull(
                        UUID fileId,
                        UUID townId,
                        NodeType nodeType);

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

        List<Node> findByParentInAndDeletedAtIsNull(List<Node> nodes);

        List<Node> findByParentIn(List<Node> nodes);

        List<Node> findByParentInAndDeletedAtIsNotNull(List<Node> nodes);
}
