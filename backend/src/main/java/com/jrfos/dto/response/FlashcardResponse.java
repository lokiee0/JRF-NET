package com.jrfos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardResponse {
    private Long id;
    private String frontContent;
    private String backContent;
    private Integer repetitionCount;
    private Double easeFactor;
    private Integer intervalDays;
    private LocalDateTime nextReviewDate;
    private LocalDateTime lastReviewedAt;
}
