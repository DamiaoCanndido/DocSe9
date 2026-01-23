package com.nergal.docseq.helpers.specifications;

import org.springframework.data.jpa.domain.Specification;

import com.nergal.docseq.entities.Folder;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class FolderParentSpecifications {
    
    public static Specification<Folder> withFilters(UUID parentId, String name) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            predicates.add(cb.equal(root.get("parent").get("folderId"), parentId));
            
            predicates.add(cb.isNull(root.get("deletedAt")));
            
            if (name != null && !name.isEmpty()) {
                predicates.add(cb.like(
                    cb.lower(root.get("name")), 
                    "%" + name.toLowerCase() + "%"
                ));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
