package com.nergal.docseq.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.User;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private User user;
    private Role roleBasic;
    private Role roleAdmin;

    @BeforeEach
    void setUp() {
        user = new User();

        roleBasic = new Role();
        roleAdmin = new Role();

        roleBasic.setName(Role.Values.basic);

        roleAdmin.setName(Role.Values.admin);

        roleRepository.save(roleBasic);
        roleRepository.save(roleAdmin);

        var userRole = roleRepository.findByName(Role.Values.basic).get();
        user.setEmail("teste@email.com");
        user.setUsername("João Silva");
        user.setPassword("123456");
        user.setRoles(Set.of(userRole));
    }

    @Test
    @DisplayName("You should be able to find the user by email if an email address exists.")
    void shouldFindByEmail_WhenEmailExists() {

        userRepository.save(user);

        Optional<User> result = userRepository.findByEmail("teste@email.com");

        assertTrue(result.isPresent());
        assertEquals("teste@email.com", result.get().getEmail());
        assertEquals("João Silva", result.get().getUsername());
    }

    @Test
    @DisplayName("Should not find user by email if email does not exist")
    void shouldNotFindByEmail_WhenEmailDoesNotExist() {
        Optional<User> result = userRepository.findByEmail("nonexistent@email.com");
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("You should be able to find the user by username if a username exists.")
    void shouldFindByUsername_WhenUsernameExists() {
        userRepository.save(user);
        Optional<User> result = userRepository.findByUsername("João Silva");
        assertTrue(result.isPresent());
        assertEquals("teste@email.com", result.get().getEmail());
        assertEquals("João Silva", result.get().getUsername());
    }

    @Test
    @DisplayName("Should not find user by username if username does not exist")
    void shouldNotFindByUsername_WhenUsernameDoesNotExist() {
        Optional<User> result = userRepository.findByUsername("NonExistentUser");
        assertTrue(result.isEmpty());
    }
}
