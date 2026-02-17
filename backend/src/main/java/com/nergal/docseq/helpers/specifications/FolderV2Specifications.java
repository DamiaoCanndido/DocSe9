package com.nergal.docseq.helpers.specifications;

import com.nergal.docseq.entities.Node;
import com.nergal.docseq.entities.NodeType;
import com.nergal.docseq.entities.PermissionV2;
import com.nergal.docseq.entities.PermissionType;
import com.nergal.docseq.entities.UserV2;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class FolderV2Specifications { // Renamed from FolderSpecifications

    public static Specification<Node> withRootFilters( // Changed Folder to Node
            UUID townId,
            String name,
            PermissionType permissionType,
            UUID userId,
            boolean isManager) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("nodeType"), NodeType.folder)); // Added NodeType check
            predicates.add(cb.equal(root.get("town").get("townId"), townId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (name == null || name.isEmpty()) {
                if (isManager) {
                    // MANAGER: apenas pastas raiz
                    predicates.add(cb.isNull(root.get("parent")));
                } else if (userId != null) {
                    // BASIC: APENAS pastas com permissão + primeiro nível acessível

                    // Join com permissões
                    Join<Node, PermissionV2> permissionsJoin = root.join("permissions", JoinType.INNER); // Changed
                                                                                                         // Permission
                                                                                                         // to
                                                                                                         // PermissionV2
                    Join<PermissionV2, UserV2> userJoin = permissionsJoin.join("user", JoinType.INNER); // Changed User
                                                                                                        // to UserV2

                    // Filtro: usuário tem permissão
                    predicates.add(cb.equal(userJoin.get("userId"), userId));

                    if (permissionType != null) {
                        List<PermissionType> acceptablePermissions = getAcceptablePermissions(permissionType);
                        predicates.add(permissionsJoin.get("permissionType").in(acceptablePermissions));
                    }

                    // Subquery: verifica se o parent TAMBÉM tem permissão
                    Subquery<Long> parentHasPermissionSubquery = query.subquery(Long.class);
                    Root<Node> parentRoot = parentHasPermissionSubquery.from(Node.class); // Changed Folder to Node
                    Join<Node, PermissionV2> parentPermJoin = parentRoot.join("permissions", JoinType.INNER); // Changed
                                                                                                              // Permission
                                                                                                              // to
                                                                                                              // PermissionV2
                    Join<PermissionV2, UserV2> parentUserJoin = parentPermJoin.join("user", JoinType.INNER); // Changed
                                                                                                             // User to
                                                                                                             // UserV2

                    List<Predicate> parentPermPredicates = new ArrayList<>();
                    parentPermPredicates.add(cb.equal(parentRoot.get("nodeId"), root.get("parent").get("nodeId"))); // Changed
                                                                                                                    // folderId
                                                                                                                    // to
                                                                                                                    // nodeId
                    parentPermPredicates.add(cb.equal(parentUserJoin.get("userId"), userId));

                    if (permissionType != null) {
                        List<PermissionType> acceptablePermissions = getAcceptablePermissions(permissionType);
                        parentPermPredicates.add(parentPermJoin.get("permissionType").in(acceptablePermissions));
                    }

                    parentHasPermissionSubquery.select(cb.literal(1L))
                            .where(cb.and(parentPermPredicates.toArray(new Predicate[0])));

                    // Mostrar apenas se: parent IS NULL OU parent NÃO tem permissão
                    predicates.add(cb.or(
                            cb.isNull(root.get("parent")),
                            cb.not(cb.exists(parentHasPermissionSubquery))));

                    query.distinct(true);
                } else {
                    // Se não tem userId, não mostra nada (ou mostra só raiz)
                    predicates.add(cb.isNull(root.get("parent")));
                }
            } else {
                // Busca por nome
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"));

                if (!isManager && userId != null) {
                    Join<Node, PermissionV2> permissionsJoin = root.join("permissions", JoinType.INNER); // Changed
                                                                                                         // Permission
                                                                                                         // to
                                                                                                         // PermissionV2
                    predicates.add(cb.equal(permissionsJoin.get("user").get("userId"), userId));

                    if (permissionType != null) {
                        List<PermissionType> acceptablePermissions = getAcceptablePermissions(permissionType);
                        predicates.add(permissionsJoin.get("permissionType").in(acceptablePermissions));
                    }
                    query.distinct(true);
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Node> withSubFoldersFilters( // Changed Folder to Node
            UUID townId,
            UUID parentId,
            String name,
            PermissionType permissionType,
            UUID userId,
            boolean isManager) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("nodeType"), NodeType.folder)); // Added NodeType check
            predicates.add(cb.equal(root.get("town").get("townId"), townId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (name == null || name.isEmpty()) {
                predicates.add(cb.equal(root.get("parent").get("nodeId"), parentId)); // Changed folderId to nodeId

                if (!isManager && userId != null) {
                    // BASIC: APENAS pastas com permissão + primeiro nível acessível

                    // Join com permissões
                    Join<Node, PermissionV2> permissionsJoin = root.join("permissions", JoinType.INNER); // Changed
                                                                                                         // Permission
                                                                                                         // to
                                                                                                         // PermissionV2
                    Join<PermissionV2, UserV2> userJoin = permissionsJoin.join("user", JoinType.INNER); // Changed User
                                                                                                        // to UserV2

                    // Filtro: usuário tem permissão
                    predicates.add(cb.equal(userJoin.get("userId"), userId));

                    if (permissionType != null) {
                        List<PermissionType> acceptablePermissions = getAcceptablePermissions(permissionType);
                        predicates.add(permissionsJoin.get("permissionType").in(acceptablePermissions));
                    }

                    // Subquery: verifica se ALGUMA filha desta pasta TEM permissão
                    Subquery<Long> childHasPermissionSubquery = query.subquery(Long.class);
                    Root<Node> childRoot = childHasPermissionSubquery.from(Node.class); // Changed Folder to Node
                    Join<Node, PermissionV2> childPermJoin = childRoot.join("permissions", JoinType.INNER); // Changed
                                                                                                            // Permission
                                                                                                            // to
                                                                                                            // PermissionV2
                    Join<PermissionV2, UserV2> childUserJoin = childPermJoin.join("user", JoinType.INNER); // Changed
                                                                                                           // User to
                                                                                                           // UserV2

                    List<Predicate> childPermPredicates = new ArrayList<>();
                    childPermPredicates.add(cb.equal(childRoot.get("parent").get("nodeId"), root.get("nodeId"))); // Changed
                                                                                                                  // folderId
                                                                                                                  // to
                                                                                                                  // nodeId
                    childPermPredicates.add(cb.equal(childUserJoin.get("userId"), userId));
                    childPermPredicates.add(cb.isNull(childRoot.get("deletedAt")));

                    if (permissionType != null) {
                        List<PermissionType> acceptablePermissions = getAcceptablePermissions(permissionType);
                        childPermPredicates.add(childPermJoin.get("permissionType").in(acceptablePermissions));
                    }

                    childHasPermissionSubquery.select(cb.literal(1L))
                            .where(cb.and(childPermPredicates.toArray(new Predicate[0])));

                    // Mostrar apenas se NÃO houver filhas com permissão
                    // (mostra apenas o primeiro nível acessível)
                    predicates.add(cb.not(cb.exists(childHasPermissionSubquery)));

                    query.distinct(true);
                }
            } else {
                // Busca por nome
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"));

                if (!isManager && userId != null) {
                    Join<Node, PermissionV2> permissionsJoin = root.join("permissions", JoinType.INNER); // Changed
                                                                                                         // Permission
                                                                                                         // to
                                                                                                         // PermissionV2
                    predicates.add(cb.equal(permissionsJoin.get("user").get("userId"), userId));

                    if (permissionType != null) {
                        List<PermissionType> acceptablePermissions = getAcceptablePermissions(permissionType);
                        predicates.add(permissionsJoin.get("permissionType").in(acceptablePermissions));
                    }
                    query.distinct(true);
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Node> withNameSearch( // Changed Folder to Node
            UUID townId,
            String name,
            PermissionType permissionType,
            UUID userId,
            boolean isManager) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("town").get("townId"), townId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (name != null && !name.isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"));
            }

            if (!isManager && userId != null) {
                Join<Node, PermissionV2> permissionsJoin = root.join("permissions", JoinType.INNER); // Changed
                                                                                                     // Permission to
                                                                                                     // PermissionV2
                predicates.add(cb.equal(permissionsJoin.get("user").get("userId"), userId));

                if (permissionType != null) {
                    List<PermissionType> acceptablePermissions = getAcceptablePermissions(permissionType);
                    predicates.add(permissionsJoin.get("permissionType").in(acceptablePermissions));
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

    public static Specification<Node> userCanRead(UUID userId) { // Changed Folder to Node
        return (root, query, cb) -> {
            Join<Node, PermissionV2> permissions = root.join("permissions", JoinType.INNER); // Changed Permission to
                                                                                             // PermissionV2

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

    public static Specification<Node> userCanWrite(UUID userId) { // Changed Folder to Node
        return (root, query, cb) -> {
            Join<Node, PermissionV2> permissions = root.join("permissions", JoinType.INNER); // Changed Permission to
                                                                                             // PermissionV2

            query.distinct(true);

            return cb.and(
                    cb.equal(permissions.get("user").get("userId"), userId),
                    permissions.get("permissionType").in(
                            PermissionType.WRITE,
                            PermissionType.SHARE,
                            PermissionType.DELETE));
        };
    }

    public static Specification<Node> userCanShare(UUID userId) { // Changed Folder to Node
        return (root, query, cb) -> {
            Join<Node, PermissionV2> permissions = root.join("permissions", JoinType.INNER); // Changed Permission to
                                                                                             // PermissionV2

            query.distinct(true);

            return cb.and(
                    cb.equal(permissions.get("user").get("userId"), userId),
                    permissions.get("permissionType").in(
                            PermissionType.SHARE,
                            PermissionType.DELETE));
        };
    }

    public static Specification<Node> userCanDelete(UUID userId) { // Changed Folder to Node
        return (root, query, cb) -> {
            Join<Node, PermissionV2> permissions = root.join("permissions", JoinType.INNER); // Changed Permission to
                                                                                             // PermissionV2

            query.distinct(true);

            return cb.and(
                    cb.equal(permissions.get("user").get("userId"), userId),
                    cb.equal(permissions.get("permissionType"), PermissionType.DELETE));
        };
    }

    public static Specification<Node> withEagerLoading() { // Changed Folder to Node
        return (root, query, cb) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("permissions", JoinType.LEFT);
                root.fetch("town", JoinType.LEFT);
                root.fetch("createdBy", JoinType.LEFT);
                query.distinct(true);
            }
            return cb.conjunction();
        };
    }
}
