package com.jrfos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockTestResponse {
    private Long id;
    private String title;
    private LocalDate testDate;
    private Integer paper1Score;
    private Integer paper2Score;
    private Integer totalScore;
    private Double percentile;
    private String platform;
    private Boolean isJrfLevel; // JRF cutoff usually > 60% (180/300)
    private Boolean isNetLevel; // NET cutoff usually > 52% (156/300)
    
    private List<TopicPerformanceResponse> performances;
    private LocalDateTime createdAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicPerformanceResponse {
        private Long id;
        private Long subjectId;
        private String subjectName;
        private Integer correctQuestions;
        private Integer incorrectQuestions;
        private Integer unattemptedQuestions;
        private Integer totalQuestions;
        private Double accuracy;
    }
}
