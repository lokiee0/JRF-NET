package com.jrfos.controller;

import com.jrfos.dto.request.FlashcardDeckRequest;
import com.jrfos.dto.request.ReviewRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.FlashcardDeckResponse;
import com.jrfos.dto.response.FlashcardResponse;
import com.jrfos.service.FlashcardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;

    @GetMapping("/decks")
    public ApiResponse<List<FlashcardDeckResponse>> getAllDecks() {
        return ApiResponse.success(flashcardService.getAllDecks());
    }

    @GetMapping("/decks/{id}")
    public ApiResponse<FlashcardDeckResponse> getDeckById(@PathVariable Long id) {
        return ApiResponse.success(flashcardService.getDeckById(id));
    }

    @PostMapping("/decks")
    public ApiResponse<FlashcardDeckResponse> createDeck(@Valid @RequestBody FlashcardDeckRequest request) {
        return ApiResponse.success(flashcardService.createDeck(request), "Deck created successfully");
    }

    @DeleteMapping("/decks/{id}")
    public ApiResponse<Void> deleteDeck(@PathVariable Long id) {
        flashcardService.deleteDeck(id);
        return ApiResponse.success(null, "Deck deleted successfully");
    }

    @GetMapping("/decks/{id}/due")
    public ApiResponse<List<FlashcardResponse>> getDueCards(@PathVariable Long id) {
        return ApiResponse.success(flashcardService.getDueCards(id));
    }

    @GetMapping("/due-count")
    public ApiResponse<Integer> getGlobalDueCount() {
        return ApiResponse.success(flashcardService.getGlobalDueCount());
    }

    @PostMapping("/cards/{cardId}/review")
    public ApiResponse<FlashcardResponse> reviewCard(@PathVariable Long cardId, @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.success(flashcardService.reviewCard(cardId, request));
    }
}
