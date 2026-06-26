package com.jrfos.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jrfos.dto.request.FlashcardDeckRequest;
import com.jrfos.dto.request.ReviewRequest;
import com.jrfos.dto.response.FlashcardDeckResponse;
import com.jrfos.dto.response.FlashcardResponse;
import com.jrfos.entity.Flashcard;
import com.jrfos.entity.FlashcardDeck;
import com.jrfos.entity.Topic;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.FlashcardDeckRepository;
import com.jrfos.repository.FlashcardRepository;
import com.jrfos.repository.TopicRepository;
import com.jrfos.service.ai.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FlashcardService {

    private final FlashcardDeckRepository deckRepository;
    private final FlashcardRepository flashcardRepository;
    private final TopicRepository topicRepository;
    private final SpacedRepetitionService spacedRepetitionService;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public List<FlashcardDeckResponse> getAllDecks() {
        return deckRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDeckResponseSummary).collect(Collectors.toList());
    }

    public FlashcardDeckResponse getDeckById(Long id) {
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlashcardDeck", "id", id));
        return mapToDeckResponseFull(deck);
    }

    public List<FlashcardResponse> getDueCards(Long deckId) {
        return flashcardRepository.findDueCardsByDeckId(deckId, LocalDateTime.now())
                .stream().map(this::mapToFlashcardResponse).collect(Collectors.toList());
    }

    public Integer getGlobalDueCount() {
        return flashcardRepository.countAllDueCards(LocalDateTime.now());
    }

    @Transactional
    public FlashcardDeckResponse createDeck(FlashcardDeckRequest request) {
        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));
        }

        FlashcardDeck deck = FlashcardDeck.builder()
                .topic(topic)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        List<Flashcard> flashcards = new ArrayList<>();

        if (Boolean.TRUE.equals(request.getGenerateWithAi()) && topic != null) {
            int count = request.getRequestedCardCount() != null ? request.getRequestedCardCount() : 10;
            String jsonResponse = aiService.generateFlashcards(topic.getName(), count);
            
            try {
                List<Map<String, String>> parsedCards = objectMapper.readValue(jsonResponse, new TypeReference<>() {});
                
                for (Map<String, String> cardMap : parsedCards) {
                    Flashcard f = Flashcard.builder()
                            .deck(deck)
                            .frontContent(cardMap.get("frontContent"))
                            .backContent(cardMap.get("backContent"))
                            .build();
                    flashcards.add(f);
                }
            } catch (Exception e) {
                log.error("Failed to parse AI flashcards JSON", e);
                throw new RuntimeException("Failed to generate valid flashcards from AI.");
            }
        }

        deck.setFlashcards(flashcards);
        return mapToDeckResponseFull(deckRepository.save(deck));
    }

    @Transactional
    public FlashcardResponse reviewCard(Long cardId, ReviewRequest request) {
        Flashcard flashcard = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard", "id", cardId));

        spacedRepetitionService.calculateNextReview(flashcard, request.getQuality());
        
        return mapToFlashcardResponse(flashcardRepository.save(flashcard));
    }

    @Transactional
    public void deleteDeck(Long id) {
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlashcardDeck", "id", id));
        deckRepository.delete(deck);
    }

    private FlashcardDeckResponse mapToDeckResponseSummary(FlashcardDeck deck) {
        int totalCards = deck.getFlashcards().size();
        int dueCards = flashcardRepository.countDueCardsByDeckId(deck.getId(), LocalDateTime.now());

        return FlashcardDeckResponse.builder()
                .id(deck.getId())
                .topicId(deck.getTopic() != null ? deck.getTopic().getId() : null)
                .topicName(deck.getTopic() != null ? deck.getTopic().getName() : null)
                .title(deck.getTitle())
                .description(deck.getDescription())
                .totalCards(totalCards)
                .dueCardsCount(dueCards)
                .createdAt(deck.getCreatedAt())
                .build();
    }

    private FlashcardDeckResponse mapToDeckResponseFull(FlashcardDeck deck) {
        FlashcardDeckResponse response = mapToDeckResponseSummary(deck);
        response.setFlashcards(deck.getFlashcards().stream().map(this::mapToFlashcardResponse).collect(Collectors.toList()));
        return response;
    }

    private FlashcardResponse mapToFlashcardResponse(Flashcard flashcard) {
        return FlashcardResponse.builder()
                .id(flashcard.getId())
                .frontContent(flashcard.getFrontContent())
                .backContent(flashcard.getBackContent())
                .repetitionCount(flashcard.getRepetitionCount())
                .easeFactor(flashcard.getEaseFactor())
                .intervalDays(flashcard.getIntervalDays())
                .nextReviewDate(flashcard.getNextReviewDate())
                .lastReviewedAt(flashcard.getLastReviewedAt())
                .build();
    }
}
