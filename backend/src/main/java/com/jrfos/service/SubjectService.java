package com.jrfos.service;

import com.jrfos.dto.request.SubjectRequest;
import com.jrfos.dto.response.SubjectResponse;
import com.jrfos.dto.response.SubtopicResponse;
import com.jrfos.dto.response.TopicResponse;
import com.jrfos.entity.Subject;
import com.jrfos.entity.Subtopic;
import com.jrfos.entity.Topic;
import com.jrfos.enums.MasteryLevel;
import com.jrfos.enums.PaperType;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.SubjectRepository;
import com.jrfos.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for managing subjects in the UGC NET syllabus.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;

    /**
     * Retrieves all subjects ordered by display order.
     *
     * @return list of all subjects with computed progress metrics
     */
    public List<SubjectResponse> getAllSubjects() {
        log.debug("Fetching all subjects");
        return subjectRepository.findAllByOrderByDisplayOrder()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves subjects filtered by paper type.
     *
     * @param paperType the paper type to filter by
     * @return list of subjects for the specified paper type
     */
    public List<SubjectResponse> getSubjectsByPaper(PaperType paperType) {
        log.debug("Fetching subjects for paper type: {}", paperType);
        return subjectRepository.findByPaperTypeOrderByDisplayOrder(paperType)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single subject by its ID.
     *
     * @param id the subject ID
     * @return the subject response with topics and progress metrics
     * @throws ResourceNotFoundException if the subject is not found
     */
    public SubjectResponse getSubjectById(Long id) {
        log.debug("Fetching subject with id: {}", id);
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        return mapToResponse(subject);
    }

    /**
     * Creates a new subject.
     *
     * @param request the subject creation request
     * @return the created subject response
     */
    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        log.info("Creating subject: {}", request.getName());
        Subject subject = Subject.builder()
                .name(request.getName())
                .paperType(request.getPaperType())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder())
                .build();

        Subject saved = subjectRepository.save(subject);
        log.info("Created subject with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Updates an existing subject.
     *
     * @param id      the subject ID to update
     * @param request the subject update request
     * @return the updated subject response
     * @throws ResourceNotFoundException if the subject is not found
     */
    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        log.info("Updating subject with id: {}", id);
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));

        subject.setName(request.getName());
        subject.setPaperType(request.getPaperType());
        subject.setDescription(request.getDescription());
        subject.setDisplayOrder(request.getDisplayOrder());

        Subject saved = subjectRepository.save(subject);
        log.info("Updated subject with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Deletes a subject and all its associated topics and subtopics.
     *
     * @param id the subject ID to delete
     * @throws ResourceNotFoundException if the subject is not found
     */
    @Transactional
    public void deleteSubject(Long id) {
        log.info("Deleting subject with id: {}", id);
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        subjectRepository.delete(subject);
        log.info("Deleted subject with id: {}", id);
    }

    /**
     * Maps a Subject entity to SubjectResponse DTO with computed progress metrics.
     * Progress is calculated as the percentage of topics with MASTERED mastery level.
     *
     * @param subject the subject entity
     * @return the subject response DTO
     */
    private SubjectResponse mapToResponse(Subject subject) {
        List<Topic> topics = subject.getTopics() != null ? subject.getTopics() : Collections.emptyList();
        int topicCount = topics.size();
        long completedTopics = topicCount > 0
                ? topicRepository.countBySubjectIdAndMasteryLevel(subject.getId(), MasteryLevel.MASTERED)
                : 0;
        double progressPercentage = topicCount > 0
                ? (double) completedTopics / topicCount * 100.0
                : 0.0;

        List<TopicResponse> topicResponses = topics.stream()
                .map(this::mapTopicToResponse)
                .collect(Collectors.toList());

        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .paperType(subject.getPaperType())
                .description(subject.getDescription())
                .displayOrder(subject.getDisplayOrder())
                .topicCount(topicCount)
                .completedTopics(completedTopics)
                .progressPercentage(Math.round(progressPercentage * 100.0) / 100.0)
                .topics(topicResponses)
                .createdAt(subject.getCreatedAt())
                .updatedAt(subject.getUpdatedAt())
                .build();
    }

    /**
     * Maps a Topic entity to TopicResponse DTO for use within subject responses.
     *
     * @param topic the topic entity
     * @return the topic response DTO
     */
    private TopicResponse mapTopicToResponse(Topic topic) {
        List<Subtopic> subtopics = topic.getSubtopics() != null ? topic.getSubtopics() : Collections.emptyList();
        int subtopicCount = subtopics.size();
        long completedSubtopics = subtopics.stream().filter(Subtopic::getIsCompleted).count();
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
