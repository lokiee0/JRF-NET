package com.jrfos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for subtopic data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubtopicResponse {

    private Long id;
    private Long topicId;
    private String name;
    private Boolean isCompleted;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
