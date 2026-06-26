package com.jrfos.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mock_tests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class MockTest extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDate testDate;

    // UGC NET Format: Paper I (50 Qs, 100 marks), Paper II (100 Qs, 200 marks)
    
    private Integer paper1Score; // out of 100
    private Integer paper2Score; // out of 200
    
    @Column(nullable = false)
    private Integer totalScore; // out of 300

    private Double percentile; // optional
    private String platform; // e.g., "Testbook", "Gradeup"

    @OneToMany(mappedBy = "mockTest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<MockTestTopicPerformance> topicPerformances = new ArrayList<>();
}
