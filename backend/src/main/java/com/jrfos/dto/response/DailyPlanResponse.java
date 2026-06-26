package com.jrfos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyPlanResponse {
    private Long id;
    private LocalDate planDate;
    private String aiRecommendation;
    private Boolean isCompleted;
    private List<DailyPlanItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyPlanItemResponse {
        private Long id;
        private Long topicId;
        private String topicName;
        private String taskDescription;
        private Integer plannedMinutes;
        private Boolean isCompleted;
    }
}
