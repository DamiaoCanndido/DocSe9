package com.nergal.docseq.repositories;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

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
    private Role role;

    @BeforeEach
    void setUp(){
        user = new User();
        role = roleRepository.findByName(Role.Values.basic);
        user.setEmail("teste@email.com");
        user.setUsername("João Silva");
        user.setPassword("123456");
        user.setRoles(Set.of(role));
    }

    @Test
    @DisplayName("You should be able to find the user by email if an email address exists.")
    void shouldFindByEmail_WhenEmailExists() {
        
        userRepository.save(user);
        
        Optional<User> resultado = userRepository.findByEmail("teste@email.com");
        
        assertTrue(resultado.isPresent());
        assertEquals("teste@email.com", resultado.get().getEmail());
        assertEquals("João Silva", resultado.get().getUsername());
    }
}
