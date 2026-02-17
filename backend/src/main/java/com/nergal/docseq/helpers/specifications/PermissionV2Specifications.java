package com.nergal.docseq.helpers.specifications;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.nergal.docseq.entities.PermissionV2;

import jakarta.persistence.criteria.JoinType;

public class PermissionV2Specifications {

    // Specification for loading all necessary relationships
    public static Specification<PermissionV2> withEagerLoading() {
        return (root, query, cb) -> {
            // Evita fazer fetch em queries de contagem (count)
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("node", JoinType.LEFT);
                root.fetch("user", JoinType.INNER);
                root.fetch("grantedBy", JoinType.INNER);
                query.distinct(true);
            }
            return cb.conjunction();
        };
    }

    // Filter by userId (who was granted permission)
    public static Specification<PermissionV2> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("user").get("userId"), userId);
        };
    }

    // Filter by grantedBy (who granted the permission)
    public static Specification<PermissionV2> byGrantedByUserId(UUID grantedByUserId) {
        return (root, query, cb) -> {
            if (grantedByUserId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("grantedBy").get("userId"), grantedByUserId);
        };
    }
}
