package com.jrfos.dto.response;

import com.jrfos.enums.QuizSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {
    private Long id;
    private Long topicId;
    private String topicName;
    private String subjectName;
    private String title;
    private QuizSource source;
    private LocalDateTime takenAt;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Double scorePercentage;
    private List<QuizQuestionResponse> questions;
    private LocalDateTime createdAt;
}
