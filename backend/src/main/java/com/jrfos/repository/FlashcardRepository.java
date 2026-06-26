package com.jrfos.repository;

import com.jrfos.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByDeckId(Long deckId);

    @Query("SELECT f FROM Flashcard f WHERE f.deck.id = :deckId AND f.nextReviewDate <= :now ORDER BY f.nextReviewDate ASC")
    List<Flashcard> findDueCardsByDeckId(@Param("deckId") Long deckId, @Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(f) FROM Flashcard f WHERE f.deck.id = :deckId AND f.nextReviewDate <= :now")
    Integer countDueCardsByDeckId(@Param("deckId") Long deckId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(f) FROM Flashcard f WHERE f.nextReviewDate <= :now")
    Integer countAllDueCards(@Param("now") LocalDateTime now);
}
