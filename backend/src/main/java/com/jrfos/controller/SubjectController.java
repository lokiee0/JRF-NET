package com.jrfos.controller;

import com.jrfos.dto.request.SubjectRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.SubjectResponse;
import com.jrfos.enums.PaperType;
import com.jrfos.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing subjects in the UGC NET syllabus.
 */
@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    /**
     * Retrieves all subjects, optionally filtered by paper type.
     *
     * @param paperType optional paper type filter (PAPER_I or PAPER_II)
     * @return list of subjects
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getAllSubjects(
            @RequestParam(required = false) PaperType paperType) {
        List<SubjectResponse> subjects;
        if (paperType != null) {
            subjects = subjectService.getSubjectsByPaper(paperType);
        } else {
            subjects = subjectService.getAllSubjects();
        }
        return ResponseEntity.ok(ApiResponse.success(subjects));
    }

    /**
     * Retrieves a single subject by ID.
     *
     * @param id the subject ID
     * @return the subject with all its topics
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> getSubjectById(@PathVariable Long id) {
        SubjectResponse subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.success(subject));
    }

    /**
     * Creates a new subject.
     *
     * @param request the subject creation request
     * @return the created subject
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SubjectResponse>> createSubject(
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse subject = subjectService.createSubject(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(subject, "Subject created successfully"));
    }

    /**
     * Updates an existing subject.
     *
     * @param id      the subject ID to update
     * @param request the subject update request
     * @return the updated subject
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse subject = subjectService.updateSubject(id, request);
        return ResponseEntity.ok(ApiResponse.success(subject, "Subject updated successfully"));
    }

    /**
     * Deletes a subject and all associated topics and subtopics.
     *
     * @param id the subject ID to delete
     * @return success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Subject deleted successfully"));
    }
}
