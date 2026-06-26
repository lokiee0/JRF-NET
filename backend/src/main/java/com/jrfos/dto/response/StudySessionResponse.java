package com.jrfos.dto.response;

import com.jrfos.enums.SessionQuality;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionResponse {
    private Long id;
    private Long topicId;
    private String topicName;
    private String subjectName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String notes;
    private SessionQuality quality;
    private LocalDateTime createdAt;
}
