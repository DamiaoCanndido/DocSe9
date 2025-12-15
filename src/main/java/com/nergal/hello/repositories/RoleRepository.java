package com.nergal.hello.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nergal.hello.entities.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>{

    Role findByName(String name);

}
