package com.nergal.docseq.helpers.specifications;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;

import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Permission;
import com.nergal.docseq.entities.PermissionType;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class FileSpecifications {

    public static Specification<File> withSubFoldersFilters(UUID townId, UUID folderId, String name,
            PermissionType permissionType, UUID userId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("town").get("townId"), townId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (name == null || name.isEmpty()) {
                predicates.add(cb.equal(root.get("folder").get("folderId"), folderId));
            } else {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"));
            }

            if (permissionType != null || userId != null) {
                Join<File, Permission> permissionsJoin = root.join("permissions", JoinType.INNER);

                if (permissionType != null) {
                    List<PermissionType> acceptablePermissions = getAcceptablePermissions(permissionType);
                    predicates.add(permissionsJoin.get("permissionType").in(acceptablePermissions));
                }

                if (userId != null) {
                    predicates.add(cb.equal(permissionsJoin.get("user").get("userId"), userId));
                }

                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static List<PermissionType> getAcceptablePermissions(PermissionType required) {
        return Arrays.stream(PermissionType.values())
                .filter(p -> p.implies(required))
                .collect(Collectors.toList());
    }

    public static Specification<File> userCanRead(UUID userId) {
        return (root, query, cb) -> {
            Join<File, Permission> permissions = root.join("permissions", JoinType.INNER);

            query.distinct(true);

            return cb.and(
                    cb.equal(permissions.get("user").get("userId"), userId),
                    permissions.get("permissionType").in(
                            PermissionType.READ,
                            PermissionType.WRITE,
                            PermissionType.SHARE,
                            PermissionType.DELETE));
        };
    }

    public static Specification<File> withEagerLoading() {
        return (root, query, cb) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("permissions", JoinType.LEFT);
                root.fetch("folder", JoinType.LEFT);
                root.fetch("town", JoinType.LEFT);
                root.fetch("createdBy", JoinType.LEFT);
                query.distinct(true);
            }
            return cb.conjunction();
        };
    }
}