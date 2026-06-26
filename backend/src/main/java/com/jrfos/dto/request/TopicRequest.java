package com.jrfos.dto.request;

import com.jrfos.enums.MasteryLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating or updating a topic.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Topic name is required")
    private String name;

    private String description;

    private MasteryLevel masteryLevel;

    private Integer weight;

    private Integer displayOrder;
}
