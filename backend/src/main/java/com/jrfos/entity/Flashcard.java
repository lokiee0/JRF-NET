package com.jrfos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "flashcards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Flashcard extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private FlashcardDeck deck;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String frontContent; // Question/Term

    @Column(columnDefinition = "TEXT", nullable = false)
    private String backContent; // Answer/Definition

    // SM-2 Algorithm Fields
    @Builder.Default
    private Integer repetitionCount = 0;

    @Builder.Default
    private Double easeFactor = 2.5;

    @Builder.Default
    private Integer intervalDays = 0;

    @Builder.Default
    private LocalDateTime nextReviewDate = LocalDateTime.now();

    private LocalDateTime lastReviewedAt;
}
