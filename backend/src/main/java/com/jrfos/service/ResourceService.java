package com.jrfos.service;

import com.jrfos.dto.response.ResourceResponse;
import com.jrfos.entity.Resource;
import com.jrfos.entity.Topic;
import com.jrfos.enums.ResourceType;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.ResourceRepository;
import com.jrfos.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;
    private final FileStorageService fileStorageService;

    public List<ResourceResponse> getAllResources(ResourceType type) {
        List<Resource> resources;
        if (type != null) {
            resources = resourceRepository.findByResourceTypeOrderByCreatedAtDesc(type);
        } else {
            resources = resourceRepository.findAllByOrderByCreatedAtDesc();
        }
        return resources.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ResourceResponse> getResourcesByTopic(Long topicId) {
        return resourceRepository.findByTopicIdOrderByCreatedAtDesc(topicId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
        return mapToResponse(resource);
    }

    @Transactional
    public ResourceResponse uploadResource(
            Long topicId, String title, String description, ResourceType type, Integer year, MultipartFile file, String url) {
        
        Topic topic = null;
        if (topicId != null) {
            topic = topicRepository.findById(topicId)
                    .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        }

        Resource resource = Resource.builder()
                .topic(topic)
                .title(title)
                .description(description)
                .resourceType(type)
                .year(year)
                .build();

        if (type == ResourceType.LINK && url != null && !url.isBlank()) {
            resource.setFilePathOrUrl(url);
        } else if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            resource.setFilePathOrUrl(fileName);
            resource.setOriginalFileName(file.getOriginalFilename());
            resource.setFileSize(file.getSize());
        } else {
            throw new IllegalArgumentException("Either a file or a valid URL link must be provided.");
        }

        return mapToResponse(resourceRepository.save(resource));
    }

    @Transactional
    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
        
        if (resource.getResourceType() != ResourceType.LINK && resource.getFilePathOrUrl() != null) {
            fileStorageService.deleteFile(resource.getFilePathOrUrl());
        }
        
        resourceRepository.delete(resource);
    }

    private ResourceResponse mapToResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .topicId(resource.getTopic() != null ? resource.getTopic().getId() : null)
                .topicName(resource.getTopic() != null ? resource.getTopic().getName() : null)
                .subjectName(resource.getTopic() != null ? resource.getTopic().getSubject().getName() : null)
                .title(resource.getTitle())
                .description(resource.getDescription())
                .filePathOrUrl(resource.getFilePathOrUrl())
                .resourceType(resource.getResourceType())
                .year(resource.getYear())
                .originalFileName(resource.getOriginalFileName())
                .fileSize(resource.getFileSize())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
