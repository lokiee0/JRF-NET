package com.jrfos.controller;

import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.ResourceResponse;
import com.jrfos.enums.ResourceType;
import com.jrfos.service.FileStorageService;
import com.jrfos.service.ResourceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ApiResponse<List<ResourceResponse>> getAllResources(@RequestParam(required = false) ResourceType type) {
        return ApiResponse.success(resourceService.getAllResources(type));
    }

    @GetMapping("/topic/{topicId}")
    public ApiResponse<List<ResourceResponse>> getResourcesByTopic(@PathVariable Long topicId) {
        return ApiResponse.success(resourceService.getResourcesByTopic(topicId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ResourceResponse> uploadResource(
            @RequestParam(required = false) Long topicId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam ResourceType type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String url) {
        
        return ApiResponse.success(
                resourceService.uploadResource(topicId, title, description, type, year, file, url), 
                "Resource uploaded successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ApiResponse.success(null, "Resource deleted successfully");
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        // Load file as Resource
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Default if type cannot be determined
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
