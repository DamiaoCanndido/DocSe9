package com.nergal.docseq.helpers.specifications;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;

import com.nergal.docseq.entities.File;
import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.Permission;
import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.User;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

public class FileSpecifications {

    public static Specification<File> withSubFoldersFilters(UUID townId, UUID folderId, String name) {
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

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static List<PermissionType> getAcceptablePermissions(PermissionType required) {
        return Arrays.stream(PermissionType.values())
                .filter(p -> p.implies(required))
                .collect(Collectors.toList());
    }

    public static Specification<File> withFolderPermissions(
            Role.Values userRole,
            UUID userId,
            PermissionType required) {
        return (root, query, cb) -> {

            if (userRole.equals(Role.Values.manager)) {
                return cb.conjunction();
            }

            // Calcula as permissões aceitáveis (DELETE >= WRITE >= READ)
            List<PermissionType> acceptablePermissions = getAcceptablePermissions(required);

            // BASIC: DEVE ter uma das permissões aceitáveis
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<Folder> folderRoot = subquery.from(Folder.class);
            Join<Folder, Permission> permissionsJoin = folderRoot.join("permissions", JoinType.INNER);
            Join<Permission, User> userJoin = permissionsJoin.join("user", JoinType.INNER);

            List<Predicate> subPredicates = new ArrayList<>();
            subPredicates.add(cb.equal(folderRoot.get("folderId"), root.get("folder").get("folderId")));
            subPredicates.add(cb.equal(userJoin.get("userId"), userId));
            subPredicates.add(permissionsJoin.get("permissionType").in(acceptablePermissions));

            subquery.select(cb.literal(1L))
                    .where(cb.and(subPredicates.toArray(new Predicate[0])));

            return cb.exists(subquery);
        };
    }

    public static Specification<File> withEagerLoading() {
        return (root, query, cb) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("folder", JoinType.LEFT);
                root.fetch("town", JoinType.LEFT);
                root.fetch("uploadedBy", JoinType.LEFT);
                query.distinct(true);
            }
            return cb.conjunction();
        };
    }
}