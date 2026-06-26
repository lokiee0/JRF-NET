package com.jrfos.controller;

import com.jrfos.dto.request.ChatRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.ChatResponse;
import com.jrfos.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ApiResponse<List<ChatResponse>> getChatHistory(@RequestParam(required = false) Long topicId) {
        return ApiResponse.success(chatService.getChatHistory(topicId));
    }

    @PostMapping
    public ApiResponse<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request) {
        return ApiResponse.success(chatService.sendMessage(request));
    }

    @DeleteMapping
    public ApiResponse<Void> clearHistory() {
        chatService.clearHistory();
        return ApiResponse.success(null, "Chat history cleared successfully");
    }
}
