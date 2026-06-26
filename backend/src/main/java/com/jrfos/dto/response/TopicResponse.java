package com.jrfos.dto.response;

import com.jrfos.enums.MasteryLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for topic data, including computed progress metrics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {

    private Long id;
    private Long subjectId;
    private String subjectName;
    private String name;
    private String description;
    private MasteryLevel masteryLevel;
    private Integer weight;
    private Double confidenceScore;
    private Integer displayOrder;
    private int subtopicCount;
    private long completedSubtopics;
    private double progressPercentage;
    private List<SubtopicResponse> subtopics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
