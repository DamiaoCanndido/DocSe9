package com.nergal.docseq.services;

import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.UnprocessableContentException;
import org.apache.tika.Tika;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Profile("dev")
public class LocalStorageService implements StorageService {

    private static final Path ROOT = Paths.get("uploads");
    private final Tika tika = new Tika();

    @Override
    public String upload(MultipartFile file, UUID fileId) {
        validatePdf(file);

        try {
            Files.createDirectories(ROOT);

            String fileName = fileId + ".pdf";
            String objectKey = "uploads/" + fileName;

            Path target = ROOT.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return objectKey;

        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    private void validatePdf(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        // 1. Soft check: Content-Type from request
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new UnprocessableContentException("Only PDF files are allowed. (Content-Type mismatch)");
        }

        // 2. Soft check: Extension
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !originalFileName.toLowerCase().endsWith(".pdf")) {
            throw new UnprocessableContentException("Only PDF files are allowed. (Extension mismatch)");
        }

        // 3. Hard check: Magic Bytes / Content Analysis
        try {
            String mimeType = tika.detect(file.getInputStream());
            if (!"application/pdf".equalsIgnoreCase(mimeType)) {
                throw new UnprocessableContentException("File integrity check failed: Content is not a valid PDF.");
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not verify file integrity");
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
