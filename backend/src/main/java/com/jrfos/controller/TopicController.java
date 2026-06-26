package com.jrfos.controller;

import com.jrfos.dto.request.TopicRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.TopicResponse;
import com.jrfos.enums.MasteryLevel;
import com.jrfos.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing topics within subjects.
 */
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    /**
     * Retrieves all topics for a given subject.
     *
     * @param subjectId the subject ID
     * @return list of topics with progress metrics
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getTopicsBySubject(
            @PathVariable Long subjectId) {
        List<TopicResponse> topics = topicService.getTopicsBySubject(subjectId);
        return ResponseEntity.ok(ApiResponse.success(topics));
    }

    /**
     * Retrieves a single topic by ID.
     *
     * @param id the topic ID
     * @return the topic with subtopics and progress metrics
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> getTopicById(@PathVariable Long id) {
        TopicResponse topic = topicService.getTopicById(id);
        return ResponseEntity.ok(ApiResponse.success(topic));
    }

    /**
     * Creates a new topic.
     *
     * @param request the topic creation request
     * @return the created topic
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TopicResponse>> createTopic(
            @Valid @RequestBody TopicRequest request) {
        TopicResponse topic = topicService.createTopic(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(topic, "Topic created successfully"));
    }

    /**
     * Updates an existing topic.
     *
     * @param id      the topic ID to update
     * @param request the topic update request
     * @return the updated topic
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody TopicRequest request) {
        TopicResponse topic = topicService.updateTopic(id, request);
        return ResponseEntity.ok(ApiResponse.success(topic, "Topic updated successfully"));
    }

    /**
     * Updates only the mastery level of a topic.
     *
     * @param id    the topic ID
     * @param level the new mastery level
     * @return the updated topic
     */
    @PatchMapping("/{id}/mastery")
    public ResponseEntity<ApiResponse<TopicResponse>> updateMasteryLevel(
            @PathVariable Long id,
            @RequestParam MasteryLevel level) {
        TopicResponse topic = topicService.updateMasteryLevel(id, level);
        return ResponseEntity.ok(ApiResponse.success(topic, "Mastery level updated successfully"));
    }

    /**
     * Deletes a topic and all associated subtopics.
     *
     * @param id the topic ID to delete
     * @return success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Topic deleted successfully"));
    }
}
