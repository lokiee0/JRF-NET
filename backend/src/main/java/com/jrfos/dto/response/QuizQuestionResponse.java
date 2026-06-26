package com.jrfos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private Long id;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    
    // These might be null or hidden if the quiz hasn't been submitted yet
    private String correctOption;
    private String selectedOption;
    private String explanation;
    private Boolean isCorrect;
}
