package com.jrfos.dto.request;

import com.jrfos.enums.QuizSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizRequest {
    
    @NotNull(message = "Topic is required")
    private Long topicId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotNull(message = "Source is required")
    private QuizSource source;

    private Integer requestedQuestionCount; // E.g., generate 5 questions via AI
}
