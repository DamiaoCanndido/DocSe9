package com.nergal.docseq.config;

// import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.entities.Role;
import com.nergal.docseq.entities.UserV2;
import com.nergal.docseq.repositories.RoleRepository;
import com.nergal.docseq.repositories.UserV2Repository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class AdminUserV2Config implements CommandLineRunner {

    private RoleRepository roleRepository;
    private UserV2Repository userRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private AdminEnvsConfig adminEnvConfig;

    public AdminUserV2Config(
            RoleRepository roleRepository,
            UserV2Repository userRepository,
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
                    log.info("Admin V2 user already exists.");
                },
                () -> {
                    var user = new UserV2();
                    user.setUsername(adminEnvConfig.getUsername());
                    user.setEmail(adminEnvConfig.getEmail());
                    user.setPassword(passwordEncoder.encode(adminEnvConfig.getPassword()));
                    user.setRole(adminRole);
                    userRepository.save(user);
                });
    }

}
