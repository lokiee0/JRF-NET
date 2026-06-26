package com.jrfos.repository;

import com.jrfos.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllByOrderByCreatedAtAsc();
    List<ChatMessage> findByTopicIdOrderByCreatedAtAsc(Long topicId);
}
