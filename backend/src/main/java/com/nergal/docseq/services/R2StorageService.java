package com.nergal.docseq.services;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.nergal.docseq.exception.BadRequestException;
import com.nergal.docseq.exception.UnprocessableContentException;

import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Service
@Profile("prod")
public class R2StorageService implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final Tika tika = new Tika();

    @Value("${cloudflare.r2.bucket-name}")
    private String bucketName;

    @Value("${cloudflare.r2.url-expiration-minutes}")
    private int urlExpirationMinutes;

    public R2StorageService(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    @Override
    public String upload(MultipartFile file, UUID fileId) {
        validatePdf(file);

        try {
            String fileName = generateFileName(fileId);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("application/pdf")
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return fileName;

        } catch (IOException e) {
            throw new RuntimeException("Error uploading to Cloudflare R2", e);
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

        // 3. Hard check: Magic Bytes / Content Analysis (Vulnerability Item 7)
        try (java.io.InputStream is = file.getInputStream()) {
            String mimeType = tika.detect(is);
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
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

        } catch (AwsServiceException | SdkClientException e) {
            throw new RuntimeException("Error deleting file from R2", e);
        }
    }

    @Override
    public String generateTemporaryUrl(String storageKey) {
        try {

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(urlExpirationMinutes))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

            return presignedRequest.url().toString();

        } catch (Exception e) {
            throw new RuntimeException("Error generating temporary URL from R2", e);
        }
    }

    private String generateFileName(UUID storageKey) {
        return storageKey + ".pdf";
    }
}
