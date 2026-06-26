package com.jrfos.controller;

import com.jrfos.dto.request.QuizRequest;
import com.jrfos.dto.request.QuizSubmitRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.QuizResponse;
import com.jrfos.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    public ApiResponse<List<QuizResponse>> getAllQuizzes() {
        return ApiResponse.success(quizService.getAllQuizzes());
    }

    @GetMapping("/topic/{topicId}")
    public ApiResponse<List<QuizResponse>> getQuizzesByTopic(@PathVariable Long topicId) {
        return ApiResponse.success(quizService.getQuizzesByTopic(topicId));
    }

    @GetMapping("/{id}")
    public ApiResponse<QuizResponse> getQuizById(@PathVariable Long id) {
        return ApiResponse.success(quizService.getQuizById(id));
    }

    @PostMapping
    public ApiResponse<QuizResponse> createQuiz(@Valid @RequestBody QuizRequest request) {
        return ApiResponse.success(quizService.createQuiz(request), "Quiz created successfully");
    }

    @PostMapping("/submit")
    public ApiResponse<QuizResponse> submitQuiz(@Valid @RequestBody QuizSubmitRequest request) {
        return ApiResponse.success(quizService.submitQuiz(request), "Quiz submitted successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ApiResponse.success(null, "Quiz deleted successfully");
    }
}
