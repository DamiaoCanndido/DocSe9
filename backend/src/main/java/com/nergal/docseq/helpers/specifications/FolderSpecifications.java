package com.nergal.docseq.helpers.specifications;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.nergal.docseq.entities.Folder;

import jakarta.persistence.criteria.Predicate;

public class FolderSpecifications {

    public static Specification<Folder> withRootFilters(UUID townId, String name) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("town").get("townId"), townId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (name == null || name.isEmpty()) {
                predicates.add(cb.isNull(root.get("parent")));
            } else {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Folder> withSubFoldersFilters(UUID townId, UUID parentId, String name) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("town").get("townId"), townId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (name == null || name.isEmpty()) {
                predicates.add(cb.equal(root.get("parent").get("folderId"), parentId));
            } else {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
