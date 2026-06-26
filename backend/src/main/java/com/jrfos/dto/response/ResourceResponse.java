package com.jrfos.dto.response;

import com.jrfos.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private Long id;
    private Long topicId;
    private String topicName;
    private String subjectName;
    private String title;
    private String description;
    private String filePathOrUrl;
    private ResourceType resourceType;
    private Integer year;
    private String originalFileName;
    private Long fileSize;
    private LocalDateTime createdAt;
}
