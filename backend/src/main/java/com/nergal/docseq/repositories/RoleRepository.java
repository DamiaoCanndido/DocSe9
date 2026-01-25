package com.nergal.docseq.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>{

    Role findByName(Role.Values name);

}
