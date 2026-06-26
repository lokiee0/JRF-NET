package com.jrfos.repository;

import com.jrfos.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByTopicIdOrderByCreatedAtDesc(Long topicId);
    List<Quiz> findAllByOrderByCreatedAtDesc();
}
