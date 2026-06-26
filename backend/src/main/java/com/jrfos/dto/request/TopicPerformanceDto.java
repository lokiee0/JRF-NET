package com.jrfos.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicPerformanceDto {
    private Long subjectId;
    private Integer correctQuestions;
    private Integer incorrectQuestions;
    private Integer unattemptedQuestions;
}
