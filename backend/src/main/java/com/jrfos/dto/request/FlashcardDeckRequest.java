package com.jrfos.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDeckRequest {
    private Long topicId;

    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;

    // Optional fields for AI generation
    private Boolean generateWithAi;
    private Integer requestedCardCount;
}
