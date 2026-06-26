package com.jrfos.repository;

import com.jrfos.entity.Topic;
import com.jrfos.enums.MasteryLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Topic entity operations.
 */
@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    /**
     * Finds all topics for a specific subject, ordered by display order.
     *
     * @param subjectId the subject ID to filter by
     * @return list of topics ordered by displayOrder
     */
    List<Topic> findBySubjectIdOrderByDisplayOrder(Long subjectId);

    /**
     * Finds all topics with a specific mastery level.
     *
     * @param level the mastery level to filter by
     * @return list of topics matching the mastery level
     */
    List<Topic> findByMasteryLevel(MasteryLevel level);

    /**
     * Counts topics for a subject with a specific mastery level.
     *
     * @param subjectId the subject ID
     * @param level     the mastery level
     * @return count of matching topics
     */
    long countBySubjectIdAndMasteryLevel(Long subjectId, MasteryLevel level);
}
