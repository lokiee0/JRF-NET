package com.jrfos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    
    // Core KPIs
    private Double jrfReadinessScore; // 0-100 based on mocks, quizzes, syllabus coverage
    private Integer totalStudyHours;
    private Integer currentStreakDays;
    private Integer studyConsistencyScore; // 0-100 based on standard deviation of daily study hours
    
    // Syllabus Progress
    private Double paper1ProgressPct;
    private Double paper2ProgressPct;
    private Map<String, Integer> masteryDistribution; // {"NOT_STARTED": 50, "LEARNING": 30, ...}
    
    // Performance Trends
    private List<DailyStudyHours> last14DaysStudyHours;
    private List<MockTestTrend> mockTestTrends;
    
    // Weak Areas
    private List<WeakTopic> weakTopics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyStudyHours {
        private String date;
        private Double hours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MockTestTrend {
        private String date;
        private Integer totalScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeakTopic {
        private Long topicId;
        private String topicName;
        private String subjectName;
        private Double accuracy; // combined quiz and mock accuracy
    }
}
