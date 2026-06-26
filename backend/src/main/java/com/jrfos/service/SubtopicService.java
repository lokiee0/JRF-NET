package com.jrfos.service;

import com.jrfos.dto.request.SubtopicRequest;
import com.jrfos.dto.response.SubtopicResponse;
import com.jrfos.entity.Subtopic;
import com.jrfos.entity.Topic;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.SubtopicRepository;
import com.jrfos.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for managing subtopics within topics.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubtopicService {

    private final SubtopicRepository subtopicRepository;
    private final TopicRepository topicRepository;

    /**
     * Retrieves all subtopics for a given topic, ordered by display order.
     *
     * @param topicId the topic ID to get subtopics for
     * @return list of subtopic responses
     */
    public List<SubtopicResponse> getSubtopicsByTopic(Long topicId) {
        log.debug("Fetching subtopics for topic id: {}", topicId);
        return subtopicRepository.findByTopicIdOrderByDisplayOrder(topicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new subtopic under the specified topic.
     *
     * @param request the subtopic creation request
     * @return the created subtopic response
     * @throws ResourceNotFoundException if the topic is not found
     */
    @Transactional
    public SubtopicResponse createSubtopic(SubtopicRequest request) {
        log.info("Creating subtopic: {} for topic id: {}", request.getName(), request.getTopicId());
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));

        Subtopic subtopic = Subtopic.builder()
                .topic(topic)
                .name(request.getName())
                .isCompleted(request.getIsCompleted() != null ? request.getIsCompleted() : false)
                .displayOrder(request.getDisplayOrder())
                .build();

        Subtopic saved = subtopicRepository.save(subtopic);
        log.info("Created subtopic with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Updates an existing subtopic.
     *
     * @param id      the subtopic ID to update
     * @param request the subtopic update request
     * @return the updated subtopic response
     * @throws ResourceNotFoundException if the subtopic or referenced topic is not found
     */
    @Transactional
    public SubtopicResponse updateSubtopic(Long id, SubtopicRequest request) {
        log.info("Updating subtopic with id: {}", id);
        Subtopic subtopic = subtopicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subtopic", "id", id));

        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));

        subtopic.setTopic(topic);
        subtopic.setName(request.getName());
        if (request.getIsCompleted() != null) {
            subtopic.setIsCompleted(request.getIsCompleted());
        }
        subtopic.setDisplayOrder(request.getDisplayOrder());

        Subtopic saved = subtopicRepository.save(subtopic);
        log.info("Updated subtopic with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Toggles the completion status of a subtopic.
     *
     * @param id the subtopic ID to toggle
     * @return the updated subtopic response
     * @throws ResourceNotFoundException if the subtopic is not found
     */
    @Transactional
    public SubtopicResponse toggleComplete(Long id) {
        log.info("Toggling completion for subtopic id: {}", id);
        Subtopic subtopic = subtopicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subtopic", "id", id));

        subtopic.setIsCompleted(!subtopic.getIsCompleted());
        Subtopic saved = subtopicRepository.save(subtopic);
        log.info("Toggled subtopic id: {} to completed: {}", id, saved.getIsCompleted());
        return mapToResponse(saved);
    }

    /**
     * Deletes a subtopic.
     *
     * @param id the subtopic ID to delete
     * @throws ResourceNotFoundException if the subtopic is not found
     */
    @Transactional
    public void deleteSubtopic(Long id) {
        log.info("Deleting subtopic with id: {}", id);
        Subtopic subtopic = subtopicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subtopic", "id", id));
        subtopicRepository.delete(subtopic);
        log.info("Deleted subtopic with id: {}", id);
    }

    /**
     * Maps a Subtopic entity to SubtopicResponse DTO.
     *
     * @param subtopic the subtopic entity
     * @return the subtopic response DTO
     */
    private SubtopicResponse mapToResponse(Subtopic subtopic) {
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
