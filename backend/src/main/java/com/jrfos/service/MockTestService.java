package com.jrfos.service;

import com.jrfos.dto.request.MockTestRequest;
import com.jrfos.dto.request.TopicPerformanceDto;
import com.jrfos.dto.response.MockTestResponse;
import com.jrfos.entity.MockTest;
import com.jrfos.entity.MockTestTopicPerformance;
import com.jrfos.entity.Subject;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.MockTestRepository;
import com.jrfos.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MockTestService {

    private final MockTestRepository mockTestRepository;
    private final SubjectRepository subjectRepository;

    public List<MockTestResponse> getAllMockTests() {
        return mockTestRepository.findAllByOrderByTestDateDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public MockTestResponse getMockTestById(Long id) {
        MockTest mockTest = mockTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MockTest", "id", id));
        return mapToResponse(mockTest);
    }

    @Transactional
    public MockTestResponse createMockTest(MockTestRequest request) {
        MockTest mockTest = MockTest.builder()
                .title(request.getTitle())
                .testDate(request.getTestDate())
                .paper1Score(request.getPaper1Score())
                .paper2Score(request.getPaper2Score())
                .totalScore(request.getTotalScore())
                .percentile(request.getPercentile())
                .platform(request.getPlatform())
                .build();

        List<MockTestTopicPerformance> performances = new ArrayList<>();
        
        if (request.getPerformances() != null) {
            for (TopicPerformanceDto dto : request.getPerformances()) {
                Subject subject = subjectRepository.findById(dto.getSubjectId())
                        .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", dto.getSubjectId()));
                
                MockTestTopicPerformance performance = MockTestTopicPerformance.builder()
                        .mockTest(mockTest)
                        .subject(subject)
                        .correctQuestions(dto.getCorrectQuestions())
                        .incorrectQuestions(dto.getIncorrectQuestions())
                        .unattemptedQuestions(dto.getUnattemptedQuestions())
                        .build();
                performances.add(performance);
            }
        }

        mockTest.setTopicPerformances(performances);
        return mapToResponse(mockTestRepository.save(mockTest));
    }

    @Transactional
    public void deleteMockTest(Long id) {
        MockTest mockTest = mockTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MockTest", "id", id));
        mockTestRepository.delete(mockTest);
    }

    private MockTestResponse mapToResponse(MockTest mockTest) {
        // Benchmarks for CS JRF (Approximate historical thresholds)
        boolean isJrfLevel = mockTest.getTotalScore() >= 180; // 60%
        boolean isNetLevel = mockTest.getTotalScore() >= 156 && mockTest.getTotalScore() < 180; // 52% - 60%

        List<MockTestResponse.TopicPerformanceResponse> perfResponses = mockTest.getTopicPerformances().stream()
                .map(p -> MockTestResponse.TopicPerformanceResponse.builder()
                        .id(p.getId())
                        .subjectId(p.getSubject().getId())
                        .subjectName(p.getSubject().getName())
                        .correctQuestions(p.getCorrectQuestions())
                        .incorrectQuestions(p.getIncorrectQuestions())
                        .unattemptedQuestions(p.getUnattemptedQuestions())
                        .totalQuestions(p.getTotalQuestions())
                        .accuracy(p.getAccuracy())
                        .build())
                .collect(Collectors.toList());

        return MockTestResponse.builder()
                .id(mockTest.getId())
                .title(mockTest.getTitle())
                .testDate(mockTest.getTestDate())
                .paper1Score(mockTest.getPaper1Score())
                .paper2Score(mockTest.getPaper2Score())
                .totalScore(mockTest.getTotalScore())
                .percentile(mockTest.getPercentile())
                .platform(mockTest.getPlatform())
                .isJrfLevel(isJrfLevel)
                .isNetLevel(isNetLevel)
                .performances(perfResponses)
                .createdAt(mockTest.getCreatedAt())
                .build();
    }
}
