package com.jrfos.repository;

import com.jrfos.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByTopicIdOrderByStartTimeDesc(Long topicId);

    List<StudySession> findAllByOrderByStartTimeDesc();

    List<StudySession> findByStartTimeBetweenOrderByStartTimeDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(s.durationMinutes) FROM StudySession s WHERE s.startTime >= :since")
    Integer getTotalStudyTimeSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT FUNCTION('DATE', s.startTime)) FROM StudySession s")
    Integer calculateStreak();
}
