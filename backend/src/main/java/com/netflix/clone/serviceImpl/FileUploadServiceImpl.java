package com.netflix.clone.serviceImpl;

import com.netflix.clone.service.FileUploadService;
import com.netflix.clone.util.FileHandlerUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadServiceImpl implements FileUploadService {

    private Path videoStorageLocation;
    private Path imageStorageLocation;

    @Value("${file.upload.video-dir:uploads/videos}")
    private String videoDir;

    @Value("${file.upload.image-dir:uploads/images}")
    private String imageDir;

    @PostConstruct
    public void init(){
        this.videoStorageLocation = Paths.get(videoDir).toAbsolutePath().normalize();
        this.imageStorageLocation = Paths.get(imageDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.videoStorageLocation);
            Files.createDirectories(this.imageStorageLocation);
        }catch (Exception e){
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.",e);
        }
    }

    @Override
    public String storeVideoFile(MultipartFile file) {
        return storeFile(file,videoStorageLocation);
    }

    private String storeFile(MultipartFile file, Path storageLocation) {
        String fileExtension = FileHandlerUtil.extractFileExtension(file.getOriginalFilename());
        String uuid = UUID.randomUUID().toString();
        String filename = uuid + fileExtension;

        try {
            if(file.isEmpty()){
                throw new RuntimeException("Failed to store empty file "+ filename);
            }
            Path targetLocation = storageLocation.resolve((filename));
            Files.copy(file.getInputStream(),targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return uuid;
        }catch (IOException e){
            throw new RuntimeException("Filled to store file "+filename,e);
        }
    }
}
