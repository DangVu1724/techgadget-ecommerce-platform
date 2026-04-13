package com.techgadget.server.service.impl;

import com.techgadget.server.exception.BadRequestException;
import com.techgadget.server.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path uploadPath;

    public FileStorageServiceImpl(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed.");
        }

        try {
            Files.createDirectories(uploadPath);
            String extension = resolveExtension(file.getOriginalFilename());
            String filename = String.format(
                    "popup_%d_%s%s",
                    Instant.now().toEpochMilli(),
                    UUID.randomUUID().toString().replace("-", ""),
                    extension
            );
            Path target = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return "https://techgadget-ecommerce-platform.onrender.com/uploads/" + filename;
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file.");
        }
    }

    private String resolveExtension(String originalFilename) {
        if (originalFilename == null) return "";
        int idx = originalFilename.lastIndexOf('.');
        if (idx < 0 || idx == originalFilename.length() - 1) {
            return "";
        }
        return originalFilename.substring(idx).toLowerCase();
    }
}
