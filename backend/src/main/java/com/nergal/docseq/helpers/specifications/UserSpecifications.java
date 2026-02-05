package com.nergal.docseq.helpers.specifications;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.nergal.docseq.entities.User;

import jakarta.persistence.criteria.Predicate;

public class UserSpecifications {
    public static Specification<User> withFilters(String town, String name) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null) {
                predicates.add(cb.like(
                        cb.lower(root.get("username")),
                        "%" + name.toLowerCase() + "%"));

            }

            if (town != null) {
                predicates.add(cb.like(
                        cb.lower(root.get("town").get("name")),
                        "%" + town.toLowerCase() + "%"));

            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
