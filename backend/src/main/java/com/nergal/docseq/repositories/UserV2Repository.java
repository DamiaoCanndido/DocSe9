package com.nergal.docseq.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.UserV2;

@Repository
public interface UserV2Repository extends JpaRepository<UserV2, UUID>, JpaSpecificationExecutor<UserV2> {

    Optional<UserV2> findByUsername(String username);

    Optional<UserV2> findByEmail(String email);

    Optional<UserV2> findByResetToken(String resetToken);

}