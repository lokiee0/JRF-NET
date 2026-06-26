package com.jrfos.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jrfos.dto.request.QuizRequest;
import com.jrfos.dto.request.QuizSubmitRequest;
import com.jrfos.dto.response.QuizQuestionResponse;
import com.jrfos.dto.response.QuizResponse;
import com.jrfos.entity.Quiz;
import com.jrfos.entity.QuizQuestion;
import com.jrfos.entity.Topic;
import com.jrfos.enums.QuizSource;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.QuizQuestionRepository;
import com.jrfos.repository.QuizRepository;
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
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponseSummary).collect(Collectors.toList());
    }

    public List<QuizResponse> getQuizzesByTopic(Long topicId) {
        return quizRepository.findByTopicIdOrderByCreatedAtDesc(topicId)
                .stream().map(this::mapToResponseSummary).collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        return mapToResponseFull(quiz, quiz.getTakenAt() != null); // Reveal answers if taken
    }

    @Transactional
    public QuizResponse createQuiz(QuizRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));

        Quiz quiz = Quiz.builder()
                .topic(topic)
                .title(request.getTitle())
                .source(request.getSource())
                .build();

        List<QuizQuestion> questions = new ArrayList<>();

        if (request.getSource() == QuizSource.AI_GENERATED) {
            int count = request.getRequestedQuestionCount() != null ? request.getRequestedQuestionCount() : 5;
            String jsonResponse = aiService.generateQuiz(topic.getName(), count);
            
            try {
                List<Map<String, String>> parsedQuestions = objectMapper.readValue(jsonResponse, new TypeReference<>() {});
                
                for (Map<String, String> qMap : parsedQuestions) {
                    QuizQuestion q = QuizQuestion.builder()
                            .quiz(quiz)
                            .question(qMap.get("question"))
                            .optionA(qMap.get("optionA"))
                            .optionB(qMap.get("optionB"))
                            .optionC(qMap.get("optionC"))
                            .optionD(qMap.get("optionD"))
                            .correctOption(qMap.get("correctOption"))
                            .explanation(qMap.get("explanation"))
                            .build();
                    questions.add(q);
                }
            } catch (Exception e) {
                log.error("Failed to parse AI quiz JSON", e);
                throw new RuntimeException("Failed to generate valid quiz questions from AI.");
            }
        }

        quiz.setTotalQuestions(questions.size());
        quiz.setQuestions(questions);

        return mapToResponseFull(quizRepository.save(quiz), false);
    }

    @Transactional
    public QuizResponse submitQuiz(QuizSubmitRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", request.getQuizId()));

        if (quiz.getTakenAt() != null) {
            throw new IllegalStateException("Quiz has already been submitted.");
        }

        int correctAnswers = 0;
        
        for (QuizQuestion question : quiz.getQuestions()) {
            String selected = request.getAnswers().get(question.getId());
            question.setSelectedOption(selected);
            
            if (selected != null && selected.equalsIgnoreCase(question.getCorrectOption())) {
                question.setIsCorrect(true);
                correctAnswers++;
            } else {
                question.setIsCorrect(false);
            }
        }

        quiz.setTakenAt(LocalDateTime.now());
        quiz.setCorrectAnswers(correctAnswers);
        quiz.setScorePercentage((double) correctAnswers / quiz.getTotalQuestions() * 100);

        return mapToResponseFull(quizRepository.save(quiz), true);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        quizRepository.delete(quiz);
    }

    private QuizResponse mapToResponseSummary(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .topicId(quiz.getTopic().getId())
                .topicName(quiz.getTopic().getName())
                .subjectName(quiz.getTopic().getSubject().getName())
                .title(quiz.getTitle())
                .source(quiz.getSource())
                .takenAt(quiz.getTakenAt())
                .totalQuestions(quiz.getTotalQuestions())
                .correctAnswers(quiz.getCorrectAnswers())
                .scorePercentage(quiz.getScorePercentage())
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    private QuizResponse mapToResponseFull(Quiz quiz, boolean revealAnswers) {
        QuizResponse response = mapToResponseSummary(quiz);
        
        List<QuizQuestionResponse> questionResponses = quiz.getQuestions().stream().map(q -> {
            QuizQuestionResponse qr = QuizQuestionResponse.builder()
                    .id(q.getId())
                    .question(q.getQuestion())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .build();
            
            if (revealAnswers) {
                qr.setCorrectOption(q.getCorrectOption());
                qr.setSelectedOption(q.getSelectedOption());
                qr.setExplanation(q.getExplanation());
                qr.setIsCorrect(q.getIsCorrect());
            }
            return qr;
        }).collect(Collectors.toList());
        
        response.setQuestions(questionResponses);
        return response;
    }
}
