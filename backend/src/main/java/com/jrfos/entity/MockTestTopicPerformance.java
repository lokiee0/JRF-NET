package com.jrfos.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "mock_test_topic_performances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class MockTestTopicPerformance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_test_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private MockTest mockTest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Subject subject; // Representing a broad area (e.g., "Data Structures")

    private Integer correctQuestions;
    private Integer incorrectQuestions;
    private Integer unattemptedQuestions;
    
    public Integer getTotalQuestions() {
        return (correctQuestions != null ? correctQuestions : 0) +
               (incorrectQuestions != null ? incorrectQuestions : 0) +
               (unattemptedQuestions != null ? unattemptedQuestions : 0);
    }
    
    public Double getAccuracy() {
        int totalAttempted = (correctQuestions != null ? correctQuestions : 0) + (incorrectQuestions != null ? incorrectQuestions : 0);
        if (totalAttempted == 0) return 0.0;
        return ((double) (correctQuestions != null ? correctQuestions : 0) / totalAttempted) * 100;
    }
}
