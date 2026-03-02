package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.NodeUserMetadata;

@Repository
public interface NodeUserMetadataRepository extends JpaRepository<NodeUserMetadata, UUID> {
    Optional<NodeUserMetadata> findByNodeNodeIdAndUserUserId(UUID nodeId, UUID userId);

    @Query("""
                SELECT m FROM NodeUserMetadata m
                JOIN FETCH m.node n
                WHERE m.user.userId = :userId
                AND n.nodeType = 'file'
                AND n.deletedAt IS NULL
                AND m.lastSeen IS NOT NULL
                ORDER BY m.lastSeen DESC
            """)
    List<NodeUserMetadata> findRecentFilesByUser(@Param("userId") UUID userId, Pageable pageable);
}
