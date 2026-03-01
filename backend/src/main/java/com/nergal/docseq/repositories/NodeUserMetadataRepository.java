package com.nergal.docseq.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.NodeUserMetadata;

@Repository
public interface NodeUserMetadataRepository extends JpaRepository<NodeUserMetadata, UUID> {
    Optional<NodeUserMetadata> findByNodeNodeIdAndUserUserId(UUID nodeId, UUID userId);
}
