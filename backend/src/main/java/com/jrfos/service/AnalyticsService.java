package com.jrfos.service;

import com.jrfos.dto.response.AnalyticsResponse;
import com.jrfos.entity.*;
import com.jrfos.enums.MasteryLevel;
import com.jrfos.enums.PaperType;
import com.jrfos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final StudySessionRepository studySessionRepository;
    private final MockTestRepository mockTestRepository;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final QuizRepository quizRepository;

    public AnalyticsResponse getDashboardAnalytics() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        LocalDate today = LocalDate.now();

        // ── 1. Total study hours (all time) ─────────────────────────────────────
        List<StudySession> allSessions = studySessionRepository.findAll();
        double totalHoursAllTime = allSessions.stream()
                .filter(s -> s.getDurationMinutes() != null)
                .mapToInt(StudySession::getDurationMinutes)
                .sum() / 60.0;

        // ── 2. Last-14-days chart data ───────────────────────────────────────────
        LocalDate twoWeeksAgo = today.minusDays(13);
        Map<LocalDate, Double> hoursPerDay = new LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            hoursPerDay.put(today.minusDays(i), 0.0);
        }

        for (StudySession session : allSessions) {
            if (session.getDurationMinutes() != null && session.getStartTime() != null) {
                LocalDate date = session.getStartTime().toLocalDate();
                if (!date.isBefore(twoWeeksAgo) && !date.isAfter(today)) {
                    hoursPerDay.merge(date, session.getDurationMinutes() / 60.0, Double::sum);
                }
            }
        }

        List<AnalyticsResponse.DailyStudyHours> last14DaysStudyHours = hoursPerDay.entrySet().stream()
                .map(e -> new AnalyticsResponse.DailyStudyHours(
                        e.getKey().format(formatter),
                        Math.round(e.getValue() * 10.0) / 10.0))
                .collect(Collectors.toList());

        // ── 3. Streak (uses ALL sessions, not just last 14 days) ────────────────
        int currentStreak = calculateStreak(allSessions);

        // ── 4. Study consistency score (0–100) ───────────────────────────────────
        // Based on how many of the last 30 days had any study activity.
        int consistencyScore = calculateConsistencyScore(allSessions, today);

        // ── 5. Mock test trends ──────────────────────────────────────────────────
        List<MockTest> mockTests = mockTestRepository.findAllByOrderByTestDateDesc();
        List<AnalyticsResponse.MockTestTrend> mockTestTrends = new ArrayList<>();
        int mockLimit = Math.min(10, mockTests.size());
        for (int i = mockLimit - 1; i >= 0; i--) {
            MockTest mt = mockTests.get(i);
            mockTestTrends.add(new AnalyticsResponse.MockTestTrend(
                    mt.getTestDate().format(formatter),
                    mt.getTotalScore()));
        }

        // ── 6. Syllabus progress ─────────────────────────────────────────────────
        List<Topic> allTopics = topicRepository.findAll();
        long paper1Total = 0, paper1Mastered = 0;
        long paper2Total = 0, paper2Mastered = 0;

        Map<String, Integer> masteryDist = new LinkedHashMap<>();
        for (MasteryLevel level : MasteryLevel.values()) {
            masteryDist.put(level.name(), 0);
        }

        for (Topic t : allTopics) {
            masteryDist.merge(t.getMasteryLevel().name(), 1, Integer::sum);
            if (t.getSubject() != null) {
                if (t.getSubject().getPaperType() == PaperType.PAPER_I) {
                    paper1Total++;
                    if (t.getMasteryLevel() == MasteryLevel.MASTERED) paper1Mastered++;
                } else if (t.getSubject().getPaperType() == PaperType.PAPER_II) {
                    paper2Total++;
                    if (t.getMasteryLevel() == MasteryLevel.MASTERED) paper2Mastered++;
                }
            }
        }

        double paper1Progress = paper1Total > 0 ? ((double) paper1Mastered / paper1Total) * 100 : 0;
        double paper2Progress = paper2Total > 0 ? ((double) paper2Mastered / paper2Total) * 100 : 0;

        // ── 7. JRF Readiness Score ──────────────────────────────────────────────
        // 40% mock test performance, 40% syllabus mastery, 20% consistency
        double avgMockScore = mockTests.stream().mapToInt(MockTest::getTotalScore).average().orElse(0);
        double mockComponent = Math.min(100, (avgMockScore / 180.0) * 100);
        double masteryComponent = (paper1Progress + paper2Progress) / 2.0;
        double consistencyComponent = consistencyScore;

        double jrfReadinessScore = (mockComponent * 0.4) + (masteryComponent * 0.4) + (consistencyComponent * 0.2);
        jrfReadinessScore = Math.min(100, Math.max(0, jrfReadinessScore));

        // ── 8. Weak topics — based on actual mastery, not random ─────────────────
        // Build a map of topicId -> quiz accuracy from submitted quizzes
        Map<Long, Double> topicQuizAccuracy = buildTopicQuizAccuracyMap();

        List<AnalyticsResponse.WeakTopic> weakTopics = allTopics.stream()
                .filter(t -> t.getMasteryLevel() == MasteryLevel.NOT_STARTED
                        || t.getMasteryLevel() == MasteryLevel.LEARNING)
                .sorted(Comparator.comparingDouble(t ->
                        topicQuizAccuracy.getOrDefault(((Topic) t).getId(), 0.0)))
                .limit(5)
                .map(t -> new AnalyticsResponse.WeakTopic(
                        t.getId(),
                        t.getName(),
                        t.getSubject() != null ? t.getSubject().getName() : "Unknown",
                        topicQuizAccuracy.getOrDefault(t.getId(), 0.0)))
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                .jrfReadinessScore(Math.round(jrfReadinessScore * 10.0) / 10.0)
                .totalStudyHours((int) totalHoursAllTime)
                .currentStreakDays(currentStreak)
                .studyConsistencyScore(consistencyScore)
                .paper1ProgressPct(Math.round(paper1Progress * 10.0) / 10.0)
                .paper2ProgressPct(Math.round(paper2Progress * 10.0) / 10.0)
                .masteryDistribution(masteryDist)
                .last14DaysStudyHours(last14DaysStudyHours)
                .mockTestTrends(mockTestTrends)
                .weakTopics(weakTopics)
                .build();
    }

    /**
     * Calculates current streak using the FULL session history, not a 14-day window.
     * Counts backwards from today; if today has no session, it checks yesterday first
     * to give grace for late-night studying.
     */
    private int calculateStreak(List<StudySession> allSessions) {
        if (allSessions.isEmpty()) return 0;

        Set<LocalDate> activeDays = allSessions.stream()
                .filter(s -> s.getStartTime() != null)
                .map(s -> s.getStartTime().toLocalDate())
                .collect(Collectors.toSet());

        LocalDate cursor = LocalDate.now();

        // Grace: if no session today, still allow the streak if yesterday was active
        if (!activeDays.contains(cursor)) {
            cursor = cursor.minusDays(1);
            if (!activeDays.contains(cursor)) return 0;
        }

        int streak = 0;
        while (activeDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    /**
     * Study consistency: percentage of the last 30 days that had at least one session.
     * Capped at 100. Returns a 0–100 integer.
     */
    private int calculateConsistencyScore(List<StudySession> allSessions, LocalDate today) {
        if (allSessions.isEmpty()) return 0;

        Set<LocalDate> activeDays = allSessions.stream()
                .filter(s -> s.getStartTime() != null)
                .map(s -> s.getStartTime().toLocalDate())
                .collect(Collectors.toSet());

        long activeDaysInLast30 = 0;
        for (int i = 0; i < 30; i++) {
            if (activeDays.contains(today.minusDays(i))) {
                activeDaysInLast30++;
            }
        }

        return (int) Math.round((activeDaysInLast30 / 30.0) * 100);
    }

    /**
     * Builds a map of topicId -> average quiz accuracy from all submitted (taken) quizzes.
     * Topics with no quizzes get 0.0 accuracy (treated as weakest).
     */
    private Map<Long, Double> buildTopicQuizAccuracyMap() {
        List<Quiz> completedQuizzes = quizRepository.findAll().stream()
                .filter(q -> q.getTakenAt() != null && q.getTotalQuestions() != null
                        && q.getTotalQuestions() > 0 && q.getScorePercentage() != null)
                .collect(Collectors.toList());

        Map<Long, List<Double>> topicScores = new HashMap<>();
        for (Quiz quiz : completedQuizzes) {
            if (quiz.getTopic() != null) {
                topicScores.computeIfAbsent(quiz.getTopic().getId(), k -> new ArrayList<>())
                        .add(quiz.getScorePercentage());
            }
        }

        Map<Long, Double> result = new HashMap<>();
        for (Map.Entry<Long, List<Double>> entry : topicScores.entrySet()) {
            double avg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            result.put(entry.getKey(), Math.round(avg * 10.0) / 10.0);
        }
        return result;
    }
}
