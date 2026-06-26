package com.jrfos.repository;

import com.jrfos.entity.Subtopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Subtopic entity operations.
 */
@Repository
public interface SubtopicRepository extends JpaRepository<Subtopic, Long> {

    /**
     * Finds all subtopics for a specific topic, ordered by display order.
     *
     * @param topicId the topic ID to filter by
     * @return list of subtopics ordered by displayOrder
     */
    List<Subtopic> findByTopicIdOrderByDisplayOrder(Long topicId);

    /**
     * Counts subtopics for a topic with a specific completion status.
     *
     * @param topicId     the topic ID
     * @param isCompleted the completion status
     * @return count of matching subtopics
     */
    long countByTopicIdAndIsCompleted(Long topicId, Boolean isCompleted);
}
