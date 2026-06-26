package com.jrfos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class MockTestRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Date is required")
    private LocalDate testDate;

    private Integer paper1Score;
    private Integer paper2Score;
    
    @NotNull(message = "Total score is required")
    private Integer totalScore;

    private Double percentile;
    private String platform;

    private List<TopicPerformanceDto> performances;
}
