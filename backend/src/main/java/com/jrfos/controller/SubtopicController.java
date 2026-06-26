package com.jrfos.controller;

import com.jrfos.dto.request.SubtopicRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.SubtopicResponse;
import com.jrfos.service.SubtopicService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing subtopics within topics.
 */
@RestController
@RequestMapping("/api/subtopics")
@RequiredArgsConstructor
public class SubtopicController {

    private final SubtopicService subtopicService;

    /**
     * Retrieves all subtopics for a given topic.
     *
     * @param topicId the topic ID
     * @return list of subtopics
     */
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<ApiResponse<List<SubtopicResponse>>> getSubtopicsByTopic(
            @PathVariable Long topicId) {
        List<SubtopicResponse> subtopics = subtopicService.getSubtopicsByTopic(topicId);
        return ResponseEntity.ok(ApiResponse.success(subtopics));
    }

    /**
     * Creates a new subtopic.
     *
     * @param request the subtopic creation request
     * @return the created subtopic
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SubtopicResponse>> createSubtopic(
            @Valid @RequestBody SubtopicRequest request) {
        SubtopicResponse subtopic = subtopicService.createSubtopic(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(subtopic, "Subtopic created successfully"));
    }

    /**
     * Updates an existing subtopic.
     *
     * @param id      the subtopic ID to update
     * @param request the subtopic update request
     * @return the updated subtopic
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubtopicResponse>> updateSubtopic(
            @PathVariable Long id,
            @Valid @RequestBody SubtopicRequest request) {
        SubtopicResponse subtopic = subtopicService.updateSubtopic(id, request);
        return ResponseEntity.ok(ApiResponse.success(subtopic, "Subtopic updated successfully"));
    }

    /**
     * Toggles the completion status of a subtopic.
     *
     * @param id the subtopic ID to toggle
     * @return the updated subtopic
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<SubtopicResponse>> toggleComplete(@PathVariable Long id) {
        SubtopicResponse subtopic = subtopicService.toggleComplete(id);
        return ResponseEntity.ok(ApiResponse.success(subtopic, "Subtopic toggled successfully"));
    }

    /**
     * Deletes a subtopic.
     *
     * @param id the subtopic ID to delete
     * @return success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubtopic(@PathVariable Long id) {
        subtopicService.deleteSubtopic(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Subtopic deleted successfully"));
    }
}
