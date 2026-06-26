package com.jrfos.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
    
    @NotNull(message = "Quiz ID is required")
    private Long quizId;
    
    // Map of question ID to selected option (A, B, C, D)
    @NotNull(message = "Answers map is required")
    private Map<Long, String> answers;
}
