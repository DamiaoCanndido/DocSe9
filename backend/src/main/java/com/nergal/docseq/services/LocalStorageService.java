package com.nergal.docseq.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Profile("dev")
public class LocalStorageService implements StorageService {

    private static final Path ROOT = Paths.get("uploads");

    @Override
    public String upload(MultipartFile file, UUID fileId) {
        try {
            Files.createDirectories(ROOT);

            String objectKey = "uploads/" + fileId + ".pdf";

            Path target = ROOT.resolve(fileId + ".pdf");
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return objectKey;

        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(Paths.get(storageKey));
        } catch (IOException ignored) {
        }
    }

    @Override
    public String generateTemporaryUrl(String storageKey) {
        return "http://localhost:9090/" + storageKey;
    }
}
