package com.nergal.docseq.services;

import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Profile("prod")
public class S3StorageService implements StorageService {

    @Override
    public String upload(MultipartFile file, UUID fileId) {
        // upload no S3
        return "s3-key";
    }

    @Override
    public void delete(String storageKey) {
        // delete no S3
    }

    @Override
    public String generateTemporaryUrl(String storageKey) {
        // presigned URL
        return "https://s3-temp-url";
    }
}
