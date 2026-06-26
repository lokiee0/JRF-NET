package com.jrfos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private Long id;
    private Long topicId;
    private String topicName;
    private String subjectName;
    private String title;
    private String content;
    private String aiSummary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
