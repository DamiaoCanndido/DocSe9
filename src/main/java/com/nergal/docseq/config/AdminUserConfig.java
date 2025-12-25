package com.nergal.docseq.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.repositories.RoleRepository;
import com.nergal.docseq.repositories.UserRepository;

@Configuration
public class AdminUserConfig implements CommandLineRunner {

    private RoleRepository roleRepository;
    private UserRepository userRepository;
    private BCryptPasswordEncoder passwordEncoder;
    

    public AdminUserConfig( RoleRepository roleRepository, 
                            UserRepository userRepository,
                            BCryptPasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    @Transactional
    public void run(String... args) throws Exception {
        var roleAdmin = roleRepository.findByName(Role.Values.admin.name());
        var userAdmin = userRepository.findByEmail("admin@admin.com");

         userAdmin.ifPresentOrElse(
                user -> {
                    System.out.println("admin already exists");
                },
                () -> {
                    var user = new User();
                    user.setUsername("admin");
                    user.setEmail("admin@admin.com");
                    user.setPassword(passwordEncoder.encode("123456"));
                    user.setRoles(Set.of(roleAdmin));
                    userRepository.save(user);
                }
        );
    }

}
