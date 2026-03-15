package com.nergal.docseq.repositories;

import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.PermissionV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionV2Repository
        extends JpaRepository<PermissionV2, UUID>, JpaSpecificationExecutor<PermissionV2> {

    // Para Nodes (files e folders)
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
            "FROM PermissionV2 p " +
            "WHERE p.user.userId = :userId " +
            "AND p.node.nodeId = :nodeId " +
            "AND p.permissionType IN :types ")
    boolean existsByUserUserIdAndNodeNodeIdAndPermissionTypeIn(
            @Param("userId") UUID userId,
            @Param("nodeId") UUID nodeId,
            @Param("types") List<PermissionType> types);

    Optional<PermissionV2> findByUserUserIdAndNodeNodeIdAndPermissionType(
            UUID userId, UUID nodeId, PermissionType permissionType);

    Optional<PermissionV2> findByUserUserIdAndNodeNodeId(UUID userId, UUID nodeId);

    @Query("SELECT p FROM PermissionV2 p WHERE p.user.userId = :userId AND p.node.nodeId = :nodeId AND p.node.town.townId = :townId")
    Optional<PermissionV2> findByUserUserIdAndNodeNodeIdAndTownId(
            @Param("userId") UUID userId, @Param("nodeId") UUID nodeId, @Param("townId") UUID townId);

    List<PermissionV2> findByNodeNodeId(UUID nodeId);

    void deleteByUserUserIdAndNodeNodeIdAndPermissionType(
            UUID userId, UUID nodeId, PermissionType permissionType);

    List<PermissionV2> findByUserUserId(UUID userId);

    List<PermissionV2> findByGrantedByUserId(UUID grantedByUserId);
}
