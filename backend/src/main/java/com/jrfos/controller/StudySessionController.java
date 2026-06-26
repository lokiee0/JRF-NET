package com.jrfos.controller;

import com.jrfos.dto.request.StudySessionRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.StudySessionResponse;
import com.jrfos.service.StudySessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService sessionService;

    @GetMapping
    public ApiResponse<List<StudySessionResponse>> getAllSessions() {
        return ApiResponse.success(sessionService.getAllSessions());
    }

    @GetMapping("/topic/{topicId}")
    public ApiResponse<List<StudySessionResponse>> getSessionsByTopic(@PathVariable Long topicId) {
        return ApiResponse.success(sessionService.getSessionsByTopic(topicId));
    }

    @PostMapping
    public ApiResponse<StudySessionResponse> createSession(@Valid @RequestBody StudySessionRequest request) {
        return ApiResponse.success(sessionService.createSession(request), "Study session logged successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ApiResponse.success(null, "Study session deleted successfully");
    }
}
