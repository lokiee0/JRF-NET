package com.jrfos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating or updating a subtopic.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubtopicRequest {

    @NotNull(message = "Topic ID is required")
    private Long topicId;

    @NotBlank(message = "Subtopic name is required")
    private String name;

    private Boolean isCompleted;

    private Integer displayOrder;
}
