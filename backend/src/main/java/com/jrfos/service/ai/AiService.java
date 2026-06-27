package com.jrfos.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import com.jrfos.service.AnalyticsService;
import com.jrfos.dto.response.AnalyticsResponse;

@Slf4j
@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    // Configurable exam date/label — keep these in sync with frontend/src/lib/constants.js
    @Value("${app.exam-date:2025-12-15}")
    private String examDateStr;

    @Value("${app.exam-label:UGC NET JRF Computer Science}")
    private String examLabel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AnalyticsService analyticsService;

    public AiService(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;

        // Bug fix: previously RestTemplate had no connect/read timeout, so a hung
        // Gemini API call would block the request thread indefinitely.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(30_000);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Builds the headers for a Gemini API call, sending the key as a header
     * instead of a URL query parameter (query params leak into access/proxy logs).
     */
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);
        return headers;
    }

    public String generateSummary(String content) {
        if ("mock_key".equals(apiKey) || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured or is a mock key. Returning a mock summary.");
            return "This is a mock AI summary. Please configure your GEMINI_API_KEY to see real summaries.";
        }

        try {
            String url = apiUrl;

            HttpHeaders headers = buildHeaders();

            Map<String, Object> part = new HashMap<>();
            part.put("text", "Summarize the following study notes concisely in markdown format. Extract the key concepts and formulas if any:\n\n" + content);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(contentMap));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String responseStr = restTemplate.postForObject(url, request, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Failed to generate AI summary", e);
            throw new RuntimeException("AI Summarization failed: " + e.getMessage());
        }
    }
    public String generateQuiz(String topicName, int questionCount) {
        if ("mock_key".equals(apiKey) || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured. Returning mock quiz JSON.");
            return String.format("""
            [
              {
                "question": "What is the primary purpose of %s?",
                "optionA": "Option A",
                "optionB": "Option B",
                "optionC": "Option C",
                "optionD": "Option D",
                "correctOption": "A",
                "explanation": "This is a mock explanation."
              }
            ]
            """, topicName);
        }

        try {
            String url = apiUrl;

            HttpHeaders headers = buildHeaders();

            String prompt = String.format(
                "Generate %d multiple-choice questions for the topic: '%s'. " +
                "Respond ONLY with a valid JSON array. Each object in the array MUST have the exact following keys: " +
                "\"question\", \"optionA\", \"optionB\", \"optionC\", \"optionD\", \"correctOption\" (must be 'A', 'B', 'C', or 'D'), and \"explanation\". " +
                "Do not include any markdown formatting like ```json or anything else outside the JSON array.",
                questionCount, topicName
            );

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(contentMap));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String responseStr = restTemplate.postForObject(url, request, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            
            String jsonOutput = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            // Clean up any potential markdown wrapper
            if (jsonOutput.startsWith("```json")) {
                jsonOutput = jsonOutput.substring(7);
            }
            if (jsonOutput.endsWith("```")) {
                jsonOutput = jsonOutput.substring(0, jsonOutput.length() - 3);
            }
            
            return jsonOutput.trim();

        } catch (Exception e) {
            log.error("Failed to generate AI quiz", e);
            throw new RuntimeException("AI Quiz generation failed: " + e.getMessage());
        }
    }
    public String generateFlashcards(String topicName, int count) {
        if ("mock_key".equals(apiKey) || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured. Returning mock flashcards JSON.");
            return String.format("""
            [
              {
                "frontContent": "What is the core concept of %s?",
                "backContent": "This is the mock explanation for the core concept."
              }
            ]
            """, topicName);
        }

        try {
            String url = apiUrl;

            HttpHeaders headers = buildHeaders();

            String prompt = String.format(
                "Generate %d flashcards for the topic: '%s'. " +
                "Respond ONLY with a valid JSON array. Each object in the array MUST have the exact following keys: " +
                "\"frontContent\" (the question or term) and \"backContent\" (the answer or definition). " +
                "Do not include any markdown formatting like ```json or anything else outside the JSON array.",
                count, topicName
            );

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(contentMap));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String responseStr = restTemplate.postForObject(url, request, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            
            String jsonOutput = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            if (jsonOutput.startsWith("```json")) {
                jsonOutput = jsonOutput.substring(7);
            }
            if (jsonOutput.endsWith("```")) {
                jsonOutput = jsonOutput.substring(0, jsonOutput.length() - 3);
            }
            
            return jsonOutput.trim();

        } catch (Exception e) {
            log.error("Failed to generate AI flashcards", e);
            throw new RuntimeException("AI Flashcard generation failed: " + e.getMessage());
        }
    }
    public String chat(List<Map<String, String>> conversationHistory) {
        if ("mock_key".equals(apiKey) || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured. Returning mock chat response.");
            return "This is a mock response from your AI Mentor. Configure GEMINI_API_KEY to get real answers.";
        }

        try {
            String url = apiUrl;

            HttpHeaders headers = buildHeaders();

            List<Map<String, Object>> contentsList = new ArrayList<>();
            
            // Fetch User Context for AI Memories
            AnalyticsResponse analytics = analyticsService.getDashboardAnalytics();
            // Bug fix: exam date used to be hardcoded to Dec 15, 2025. Now read from
            // app.exam-date (configurable via application.yml / EXAM_DATE env var),
            // so it stays in sync with frontend/src/lib/constants.js.
            LocalDate examDate;
            try {
                examDate = LocalDate.parse(examDateStr);
            } catch (Exception ex) {
                log.warn("Invalid app.exam-date value '{}', falling back to default", examDateStr);
                examDate = LocalDate.of(2025, 12, 15);
            }
            long daysUntilExam = ChronoUnit.DAYS.between(LocalDate.now(), examDate);
            daysUntilExam = Math.max(0, daysUntilExam);

            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("You are an elite AI Mentor for a student preparing for the UGC NET JRF Computer Science exam. ");
            contextBuilder.append("Your name is 'JRF Mentor'. Be concise, accurate, encouraging, and exam-focused.\n\n");
            contextBuilder.append("EXAM CONTEXT:\n");
            contextBuilder.append(String.format("- Target Exam: %s (%s)\n", examLabel, examDate));
            contextBuilder.append(String.format("- Days Remaining: %d days\n", daysUntilExam));
            contextBuilder.append("- JRF cutoff: approximately 180/300 (60%%) for Computer Science\n\n");
            contextBuilder.append("STUDENT PROGRESS (Memory):\n");
            contextBuilder.append(String.format("- JRF Readiness Score: %.1f%%\n", analytics.getJrfReadinessScore()));
            contextBuilder.append(String.format("- Paper I Progress: %.1f%%, Paper II Progress: %.1f%%\n", analytics.getPaper1ProgressPct(), analytics.getPaper2ProgressPct()));
            contextBuilder.append("- Current Study Streak: " + analytics.getCurrentStreakDays() + " days\n");
            contextBuilder.append("- Study Consistency (last 30 days): " + analytics.getStudyConsistencyScore() + "%%\n");

            if (analytics.getWeakTopics() != null && !analytics.getWeakTopics().isEmpty()) {
                contextBuilder.append("- Weak Topics (prioritise these): ");
                for (AnalyticsResponse.WeakTopic wt : analytics.getWeakTopics()) {
                    contextBuilder.append(wt.getTopicName()).append(" (").append(wt.getSubjectName()).append("), ");
                }
                contextBuilder.append("\n");
            }
            contextBuilder.append("\nWhen answering, relate answers to the UGC NET CS syllabus wherever relevant. ")
                    .append("If the student seems to be struggling, be extra supportive. ")
                    .append("Keep responses concise but complete.");
            
            Map<String, Object> systemPart = new HashMap<>();
            systemPart.put("text", contextBuilder.toString());
            Map<String, Object> systemContentMap = new HashMap<>();
            systemContentMap.put("role", "user");
            systemContentMap.put("parts", List.of(systemPart));
            contentsList.add(systemContentMap);
            
            // Add an 'ok' acknowledgment from model for the system prompt
            Map<String, Object> ackPart = new HashMap<>();
            ackPart.put("text", "Understood. I am ready to help.");
            Map<String, Object> ackContentMap = new HashMap<>();
            ackContentMap.put("role", "model");
            ackContentMap.put("parts", List.of(ackPart));
            contentsList.add(ackContentMap);

            for (Map<String, String> msg : conversationHistory) {
                Map<String, Object> part = new HashMap<>();
                part.put("text", msg.get("content"));
                
                Map<String, Object> contentMap = new HashMap<>();
                contentMap.put("role", msg.get("role").equals("user") ? "user" : "model");
                contentMap.put("parts", List.of(part));
                contentsList.add(contentMap);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contentsList);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String responseStr = restTemplate.postForObject(url, request, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Failed to generate AI chat response", e);
            throw new RuntimeException("AI Chat failed: " + e.getMessage());
        }
    }
    public String generateStudyPlan(String weakTopicsList, String dueFlashcardsCount) {
        if ("mock_key".equals(apiKey) || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured. Returning mock plan JSON.");
            return """
            {
              "recommendation": "Focus heavily on Data Structures today as it's a weak area.",
              "tasks": [
                { "topicName": "Data Structures", "taskDescription": "Review Binary Trees", "plannedMinutes": 45 },
                { "topicName": "Operating Systems", "taskDescription": "Read about Deadlocks", "plannedMinutes": 30 },
                { "topicName": "General", "taskDescription": "Review due flashcards", "plannedMinutes": 15 }
              ]
            }
            """;
        }

        try {
            String url = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = String.format(
                "You are an AI study planner for UGC NET JRF Computer Science. " +
                "The student has the following weak topics: %s. " +
                "They also have %s flashcards due for review today. " +
                "Generate a study plan for today. " +
                "Respond ONLY with a valid JSON object containing two keys: " +
                "1. \"recommendation\" (a short motivational string explaining the strategy for today) " +
                "2. \"tasks\" (a JSON array of objects, each with \"topicName\", \"taskDescription\", and \"plannedMinutes\" (integer)). " +
                "Do not include markdown or anything outside the JSON object.",
                weakTopicsList, dueFlashcardsCount
            );

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(contentMap));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String responseStr = restTemplate.postForObject(url, request, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            
            String jsonOutput = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            if (jsonOutput.startsWith("```json")) {
                jsonOutput = jsonOutput.substring(7);
            }
            if (jsonOutput.endsWith("```")) {
                jsonOutput = jsonOutput.substring(0, jsonOutput.length() - 3);
            }
            
            return jsonOutput.trim();

        } catch (Exception e) {
            log.error("Failed to generate AI study plan", e);
            throw new RuntimeException("AI Plan generation failed: " + e.getMessage());
        }
    }
}
