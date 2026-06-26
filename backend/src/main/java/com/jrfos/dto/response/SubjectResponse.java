package com.jrfos.dto.response;

import com.jrfos.enums.PaperType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for subject data, including computed progress metrics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponse {

    private Long id;
    private String name;
    private PaperType paperType;
    private String description;
    private Integer displayOrder;
    private int topicCount;
    private long completedTopics;
    private double progressPercentage;
    private List<TopicResponse> topics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
