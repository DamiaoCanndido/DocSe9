package com.nergal.docseq.services;

import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String upload(MultipartFile file, UUID fileId);

    void delete(String storageKey);

    String generateTemporaryUrl(String storageKey);
}
