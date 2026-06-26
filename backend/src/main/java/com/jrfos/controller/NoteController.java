package com.jrfos.controller;

import com.jrfos.dto.request.NoteRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.NoteResponse;
import com.jrfos.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ApiResponse<List<NoteResponse>> getAllNotes(@RequestParam(required = false) String query) {
        return ApiResponse.success(noteService.getAllNotes(query));
    }

    @GetMapping("/topic/{topicId}")
    public ApiResponse<List<NoteResponse>> getNotesByTopic(@PathVariable Long topicId) {
        return ApiResponse.success(noteService.getNotesByTopic(topicId));
    }

    @GetMapping("/{id}")
    public ApiResponse<NoteResponse> getNoteById(@PathVariable Long id) {
        return ApiResponse.success(noteService.getNoteById(id));
    }

    @PostMapping
    public ApiResponse<NoteResponse> createNote(@Valid @RequestBody NoteRequest request) {
        return ApiResponse.success(noteService.createNote(request), "Note created successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<NoteResponse> updateNote(@PathVariable Long id, @Valid @RequestBody NoteRequest request) {
        return ApiResponse.success(noteService.updateNote(id, request), "Note updated successfully");
    }

    @PostMapping("/{id}/summarize")
    public ApiResponse<NoteResponse> generateAiSummary(@PathVariable Long id) {
        return ApiResponse.success(noteService.generateAiSummary(id), "AI Summary generated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ApiResponse.success(null, "Note deleted successfully");
    }
}
