package com.nergal.docseq.helpers.specifications;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.nergal.docseq.entities.TownV2;

import jakarta.persistence.criteria.Predicate;

public class TownSpecifications {
    public static Specification<TownV2> withFilters(String name) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"));

            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
