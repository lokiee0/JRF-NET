package com.jrfos.repository;

import com.jrfos.entity.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {
    List<FlashcardDeck> findByTopicIdOrderByCreatedAtDesc(Long topicId);
    List<FlashcardDeck> findAllByOrderByCreatedAtDesc();
}
