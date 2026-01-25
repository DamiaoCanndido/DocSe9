package com.nergal.docseq.helpers.specifications;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.nergal.docseq.entities.File;

import jakarta.persistence.criteria.Predicate;

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
}