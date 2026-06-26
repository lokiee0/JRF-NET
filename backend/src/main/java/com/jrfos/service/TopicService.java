package com.jrfos.service;

import com.jrfos.dto.request.TopicRequest;
import com.jrfos.dto.response.SubtopicResponse;
import com.jrfos.dto.response.TopicResponse;
import com.jrfos.entity.Subject;
import com.jrfos.entity.Subtopic;
import com.jrfos.entity.Topic;
import com.jrfos.enums.MasteryLevel;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.SubjectRepository;
import com.jrfos.repository.SubtopicRepository;
import com.jrfos.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for managing topics within subjects.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final SubtopicRepository subtopicRepository;

    /**
     * Retrieves all topics for a given subject, ordered by display order.
     *
     * @param subjectId the subject ID to get topics for
     * @return list of topic responses with progress metrics
     */
    public List<TopicResponse> getTopicsBySubject(Long subjectId) {
        log.debug("Fetching topics for subject id: {}", subjectId);
        return topicRepository.findBySubjectIdOrderByDisplayOrder(subjectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single topic by its ID.
     *
     * @param id the topic ID
     * @return the topic response with subtopics and progress metrics
     * @throws ResourceNotFoundException if the topic is not found
     */
    public TopicResponse getTopicById(Long id) {
        log.debug("Fetching topic with id: {}", id);
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));
        return mapToResponse(topic);
    }

    /**
     * Creates a new topic under the specified subject.
     *
     * @param request the topic creation request
     * @return the created topic response
     * @throws ResourceNotFoundException if the subject is not found
     */
    @Transactional
    public TopicResponse createTopic(TopicRequest request) {
        log.info("Creating topic: {} for subject id: {}", request.getName(), request.getSubjectId());
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        Topic topic = Topic.builder()
                .subject(subject)
                .name(request.getName())
                .description(request.getDescription())
                .masteryLevel(request.getMasteryLevel() != null ? request.getMasteryLevel() : MasteryLevel.NOT_STARTED)
                .weight(request.getWeight() != null ? request.getWeight() : 1)
                .displayOrder(request.getDisplayOrder())
                .build();

        Topic saved = topicRepository.save(topic);
        log.info("Created topic with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Updates an existing topic.
     *
     * @param id      the topic ID to update
     * @param request the topic update request
     * @return the updated topic response
     * @throws ResourceNotFoundException if the topic or referenced subject is not found
     */
    @Transactional
    public TopicResponse updateTopic(Long id, TopicRequest request) {
        log.info("Updating topic with id: {}", id);
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        topic.setSubject(subject);
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        if (request.getMasteryLevel() != null) {
            topic.setMasteryLevel(request.getMasteryLevel());
        }
        if (request.getWeight() != null) {
            topic.setWeight(request.getWeight());
        }
        topic.setDisplayOrder(request.getDisplayOrder());

        Topic saved = topicRepository.save(topic);
        log.info("Updated topic with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Updates only the mastery level of a topic.
     *
     * @param id    the topic ID
     * @param level the new mastery level
     * @return the updated topic response
     * @throws ResourceNotFoundException if the topic is not found
     */
    @Transactional
    public TopicResponse updateMasteryLevel(Long id, MasteryLevel level) {
        log.info("Updating mastery level for topic id: {} to: {}", id, level);
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));

        topic.setMasteryLevel(level);
        Topic saved = topicRepository.save(topic);
        log.info("Updated mastery level for topic id: {}", id);
        return mapToResponse(saved);
    }

    /**
     * Deletes a topic and all its associated subtopics.
     *
     * @param id the topic ID to delete
     * @throws ResourceNotFoundException if the topic is not found
     */
    @Transactional
    public void deleteTopic(Long id) {
        log.info("Deleting topic with id: {}", id);
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));
        topicRepository.delete(topic);
        log.info("Deleted topic with id: {}", id);
    }

    /**
     * Maps a Topic entity to TopicResponse DTO with computed progress metrics.
     * Progress is calculated as the percentage of completed subtopics.
     *
     * @param topic the topic entity
     * @return the topic response DTO
     */
    private TopicResponse mapToResponse(Topic topic) {
        List<Subtopic> subtopics = topic.getSubtopics() != null ? topic.getSubtopics() : Collections.emptyList();
        int subtopicCount = subtopics.size();
        long completedSubtopics = subtopicCount > 0
                ? subtopicRepository.countByTopicIdAndIsCompleted(topic.getId(), true)
                : 0;
        double progressPercentage = subtopicCount > 0
                ? (double) completedSubtopics / subtopicCount * 100.0
                : 0.0;

        List<SubtopicResponse> subtopicResponses = subtopics.stream()
                .map(this::mapSubtopicToResponse)
                .collect(Collectors.toList());

        return TopicResponse.builder()
                .id(topic.getId())
                .subjectId(topic.getSubject().getId())
                .subjectName(topic.getSubject().getName())
                .name(topic.getName())
                .description(topic.getDescription())
                .masteryLevel(topic.getMasteryLevel())
                .weight(topic.getWeight())
                .confidenceScore(topic.getConfidenceScore())
                .displayOrder(topic.getDisplayOrder())
                .subtopicCount(subtopicCount)
                .completedSubtopics(completedSubtopics)
                .progressPercentage(Math.round(progressPercentage * 100.0) / 100.0)
                .subtopics(subtopicResponses)
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }

    /**
     * Maps a Subtopic entity to SubtopicResponse DTO.
     *
     * @param subtopic the subtopic entity
     * @return the subtopic response DTO
     */
    private SubtopicResponse mapSubtopicToResponse(Subtopic subtopic) {
        return SubtopicResponse.builder()
                .id(subtopic.getId())
                .topicId(subtopic.getTopic().getId())
                .name(subtopic.getName())
                .isCompleted(subtopic.getIsCompleted())
                .displayOrder(subtopic.getDisplayOrder())
                .createdAt(subtopic.getCreatedAt())
                .updatedAt(subtopic.getUpdatedAt())
                .build();
    }
}
