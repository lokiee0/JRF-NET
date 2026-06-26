package com.jrfos.entity;

import com.jrfos.enums.MasteryLevel;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a topic within a subject.
 * Each topic tracks mastery level, confidence score, and contains subtopics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = {"subject", "subtopics"})
@ToString(exclude = {"subject", "subtopics"})
@Entity
@Table(name = "topics")
public class Topic extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Subject subject;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "mastery_level", nullable = false)
    @Builder.Default
    private MasteryLevel masteryLevel = MasteryLevel.NOT_STARTED;

    @Column(nullable = false)
    @Builder.Default
    private Integer weight = 1;

    @Column(name = "confidence_score", nullable = false)
    @Builder.Default
    private Double confidenceScore = 0.0;

    @Column(name = "display_order")
    private Integer displayOrder;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Subtopic> subtopics = new ArrayList<>();
}
