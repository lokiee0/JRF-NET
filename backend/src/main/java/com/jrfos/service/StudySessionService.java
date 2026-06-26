package com.jrfos.service;

import com.jrfos.dto.request.StudySessionRequest;
import com.jrfos.dto.response.StudySessionResponse;
import com.jrfos.entity.StudySession;
import com.jrfos.entity.Topic;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.StudySessionRepository;
import com.jrfos.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudySessionService {

    private final StudySessionRepository sessionRepository;
    private final TopicRepository topicRepository;

    public List<StudySessionResponse> getAllSessions() {
        return sessionRepository.findAllByOrderByStartTimeDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<StudySessionResponse> getSessionsByTopic(Long topicId) {
        return sessionRepository.findByTopicIdOrderByStartTimeDesc(topicId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public StudySessionResponse createSession(StudySessionRequest request) {
        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));
        }

        int durationMinutes = (int) Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();

        StudySession session = StudySession.builder()
                .topic(topic)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(durationMinutes)
                .notes(request.getNotes())
                .quality(request.getQuality())
                .build();

        StudySession saved = sessionRepository.save(session);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteSession(Long id) {
        StudySession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudySession", "id", id));
        sessionRepository.delete(session);
    }

    private StudySessionResponse mapToResponse(StudySession session) {
        return StudySessionResponse.builder()
                .id(session.getId())
                .topicId(session.getTopic() != null ? session.getTopic().getId() : null)
                .topicName(session.getTopic() != null ? session.getTopic().getName() : null)
                .subjectName(session.getTopic() != null ? session.getTopic().getSubject().getName() : null)
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .durationMinutes(session.getDurationMinutes())
                .notes(session.getNotes())
                .quality(session.getQuality())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
