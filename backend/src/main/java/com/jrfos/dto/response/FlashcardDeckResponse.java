package com.jrfos.dto.response;

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
public class FlashcardDeckResponse {
    private Long id;
    private Long topicId;
    private String topicName;
    private String title;
    private String description;
    private Integer totalCards;
    private Integer dueCardsCount;
    private List<FlashcardResponse> flashcards;
    private LocalDateTime createdAt;
}
