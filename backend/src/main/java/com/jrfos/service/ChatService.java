package com.jrfos.service;

import com.jrfos.dto.request.ChatRequest;
import com.jrfos.dto.response.ChatResponse;
import com.jrfos.entity.ChatMessage;
import com.jrfos.repository.ChatMessageRepository;
import com.jrfos.service.ai.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final AiService aiService;

    public List<ChatResponse> getChatHistory(Long topicId) {
        List<ChatMessage> messages;
        if (topicId != null) {
            messages = chatMessageRepository.findByTopicIdOrderByCreatedAtAsc(topicId);
        } else {
            messages = chatMessageRepository.findAllByOrderByCreatedAtAsc();
        }
        return messages.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ChatResponse sendMessage(ChatRequest request) {
        // 1. Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .role("user")
                .content(request.getContent())
                .topicId(request.getTopicId())
                .build();
        chatMessageRepository.save(userMessage);

        // 2. Fetch history for context (limit to last 20 messages for token efficiency)
        List<ChatMessage> history = chatMessageRepository.findAllByOrderByCreatedAtAsc();
        if (history.size() > 20) {
            history = history.subList(history.size() - 20, history.size());
        }

        List<Map<String, String>> conversationHistory = new ArrayList<>();
        for (ChatMessage msg : history) {
            Map<String, String> map = new HashMap<>();
            map.put("role", msg.getRole());
            map.put("content", msg.getContent());
            conversationHistory.add(map);
        }

        // 3. Get AI response
        String aiResponseText = aiService.chat(conversationHistory);

        // 4. Save AI response
        ChatMessage aiMessage = ChatMessage.builder()
                .role("model")
                .content(aiResponseText)
                .topicId(request.getTopicId())
                .build();
        ChatMessage savedAiMessage = chatMessageRepository.save(aiMessage);

        return mapToResponse(savedAiMessage);
    }

    @Transactional
    public void clearHistory() {
        chatMessageRepository.deleteAll();
    }

    private ChatResponse mapToResponse(ChatMessage message) {
        return ChatResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .topicId(message.getTopicId())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
