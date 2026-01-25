package com.nergal.docseq.config;

import com.nergal.docseq.services.LocalStorageService;
import com.nergal.docseq.services.StorageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("test")
public class TestConfig {

    @Bean
    public StorageService storageService() {
        return new LocalStorageService();
    }
}
