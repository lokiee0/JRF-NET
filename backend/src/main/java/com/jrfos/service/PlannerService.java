package com.jrfos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jrfos.dto.response.DailyPlanResponse;
import com.jrfos.entity.DailyPlan;
import com.jrfos.entity.DailyPlanItem;
import com.jrfos.entity.Topic;
import com.jrfos.enums.MasteryLevel;
import com.jrfos.repository.DailyPlanRepository;
import com.jrfos.repository.FlashcardRepository;
import com.jrfos.repository.TopicRepository;
import com.jrfos.service.ai.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlannerService {

    private final DailyPlanRepository dailyPlanRepository;
    private final TopicRepository topicRepository;
    private final FlashcardRepository flashcardRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public DailyPlanResponse getPlanForDate(LocalDate date) {
        return dailyPlanRepository.findByPlanDate(date)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional
    public DailyPlanResponse generatePlanForToday() {
        LocalDate today = LocalDate.now();
        
        // If plan exists, return it
        if (dailyPlanRepository.findByPlanDate(today).isPresent()) {
            return mapToResponse(dailyPlanRepository.findByPlanDate(today).get());
        }

        // 1. Gather context for AI
        List<Topic> weakTopics = topicRepository.findAll().stream()
                .filter(t -> t.getMasteryLevel() == MasteryLevel.NOT_STARTED || t.getMasteryLevel() == MasteryLevel.LEARNING)
                .limit(5)
                .collect(Collectors.toList());
        
        String weakTopicsList = weakTopics.isEmpty() ? "None specifically, review general topics" : 
                weakTopics.stream().map(Topic::getName).collect(Collectors.joining(", "));
                
        // Count total due flashcards across ALL decks
        int dueFlashcards = (int) flashcardRepository.findAll().stream()
                .filter(f -> f.getNextReviewDate() != null
                        && !f.getNextReviewDate().isAfter(java.time.LocalDateTime.now()))
                .count();
        
        // 2. Call AI
        String aiResponseJson = aiService.generateStudyPlan(weakTopicsList, String.valueOf(dueFlashcards));

        // 3. Parse and Save
        DailyPlan plan = DailyPlan.builder()
                .planDate(today)
                .build();
                
        List<DailyPlanItem> items = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(aiResponseJson);
            plan.setAiRecommendation(root.path("recommendation").asText());
            
            JsonNode tasksNode = root.path("tasks");
            if (tasksNode.isArray()) {
                for (JsonNode taskNode : tasksNode) {
                    String topicName = taskNode.path("topicName").asText();
                    
                    // Try to find matching topic in DB
                    Topic matchedTopic = topicRepository.findAll().stream()
                            .filter(t -> t.getName().equalsIgnoreCase(topicName))
                            .findFirst().orElse(null);
                            
                    DailyPlanItem item = DailyPlanItem.builder()
                            .dailyPlan(plan)
                            .topic(matchedTopic)
                            .taskDescription(taskNode.path("taskDescription").asText())
                            .plannedMinutes(taskNode.path("plannedMinutes").asInt())
                            .build();
                    items.add(item);
                }
            }
        } catch (Exception e) {
            log.error("Error parsing AI plan JSON", e);
            plan.setAiRecommendation("Failed to parse AI recommendation. Here is a generic plan.");
        }

        plan.setItems(items);
        return mapToResponse(dailyPlanRepository.save(plan));
    }

    @Transactional
    public DailyPlanResponse toggleTaskCompletion(Long planId, Long itemId, boolean completed) {
        DailyPlan plan = dailyPlanRepository.findById(planId).orElseThrow();
        
        for (DailyPlanItem item : plan.getItems()) {
            if (item.getId().equals(itemId)) {
                item.setIsCompleted(completed);
                break;
            }
        }
        
        // Check if all items are completed
        boolean allCompleted = plan.getItems().stream().allMatch(DailyPlanItem::getIsCompleted);
        plan.setIsCompleted(allCompleted);
        
        return mapToResponse(dailyPlanRepository.save(plan));
    }

    @Transactional
    public void deletePlanForToday() {
        Optional<DailyPlan> todayPlan = dailyPlanRepository.findByPlanDate(LocalDate.now());
        todayPlan.ifPresent(dailyPlanRepository::delete);
    }

    private DailyPlanResponse mapToResponse(DailyPlan plan) {
        List<DailyPlanResponse.DailyPlanItemResponse> itemResponses = plan.getItems().stream()
                .map(item -> DailyPlanResponse.DailyPlanItemResponse.builder()
                        .id(item.getId())
                        .topicId(item.getTopic() != null ? item.getTopic().getId() : null)
                        .topicName(item.getTopic() != null ? item.getTopic().getName() : "General")
                        .taskDescription(item.getTaskDescription())
                        .plannedMinutes(item.getPlannedMinutes())
                        .isCompleted(item.getIsCompleted())
                        .build())
                .collect(Collectors.toList());

        return DailyPlanResponse.builder()
                .id(plan.getId())
                .planDate(plan.getPlanDate())
                .aiRecommendation(plan.getAiRecommendation())
                .isCompleted(plan.getIsCompleted())
                .items(itemResponses)
                .build();
    }
}
