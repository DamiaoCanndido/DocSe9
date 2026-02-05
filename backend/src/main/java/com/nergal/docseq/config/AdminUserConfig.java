package com.nergal.docseq.config;

// import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.repositories.RoleRepository;
import com.nergal.docseq.repositories.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class AdminUserConfig implements CommandLineRunner {

    private RoleRepository roleRepository;
    private UserRepository userRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private AdminEnvsConfig adminEnvConfig;

    public AdminUserConfig(
            RoleRepository roleRepository,
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            AdminEnvsConfig adminEnvConfig) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEnvConfig = adminEnvConfig;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Role adminRole = roleRepository.findByName(Role.Values.admin).orElseGet(() -> {
            Role newAdminRole = new Role();
            newAdminRole.setName(Role.Values.admin);
            return roleRepository.save(newAdminRole);
        });

        roleRepository.findByName(Role.Values.manager).orElseGet(() -> {
            Role newManagerRole = new Role();
            newManagerRole.setName(Role.Values.manager);
            return roleRepository.save(newManagerRole);
        });

        roleRepository.findByName(Role.Values.basic).orElseGet(() -> {
            Role newBasicRole = new Role();
            newBasicRole.setName(Role.Values.basic);
            return roleRepository.save(newBasicRole);
        });

        var userAdmin = userRepository.findByEmail(adminEnvConfig.getEmail());

        userAdmin.ifPresentOrElse(
                user -> {
                    log.info("Admin user already exists.");
                },
                () -> {
                    var user = new User();
                    user.setUsername(adminEnvConfig.getUsername());
                    user.setEmail(adminEnvConfig.getEmail());
                    user.setPassword(passwordEncoder.encode(adminEnvConfig.getPassword()));
                    user.setRole(adminRole);
                    userRepository.save(user);
                });
    }

}
