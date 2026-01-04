package com.nergal.docseq.repositories;

import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.PermissionEnum;
import com.nergal.docseq.entities.UserPermission;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PermissionRepository extends JpaRepository<UserPermission, Long> {
    @Query("""
        select up.name
        from UserPermission up
        where up.user.username = :username
    """)
    List<String> findPermissionNamesByUsername(@Param("username") String username);

    Page<UserPermission> findByUser_UserId(UUID userId, Pageable pageable);

    boolean existsByNameAndUser_UserId(PermissionEnum name, UUID userId);

    void deleteByUser_UserIdAndName(UUID userId, PermissionEnum name);
}
