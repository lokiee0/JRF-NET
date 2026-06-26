package com.jrfos.service;

import com.jrfos.dto.request.NoteRequest;
import com.jrfos.dto.response.NoteResponse;
import com.jrfos.entity.Note;
import com.jrfos.entity.Topic;
import com.jrfos.exception.ResourceNotFoundException;
import com.jrfos.repository.NoteRepository;
import com.jrfos.repository.TopicRepository;
import com.jrfos.service.ai.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoteService {

    private final NoteRepository noteRepository;
    private final TopicRepository topicRepository;
    private final AiService aiService;

    public List<NoteResponse> getAllNotes(String query) {
        List<Note> notes;
        if (query != null && !query.isBlank()) {
            notes = noteRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByUpdatedAtDesc(query, query);
        } else {
            notes = noteRepository.findAllByOrderByUpdatedAtDesc();
        }
        return notes.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<NoteResponse> getNotesByTopic(Long topicId) {
        return noteRepository.findByTopicIdOrderByUpdatedAtDesc(topicId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public NoteResponse getNoteById(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", id));
        return mapToResponse(note);
    }

    @Transactional
    public NoteResponse createNote(NoteRequest request) {
        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));
        }

        Note note = Note.builder()
                .topic(topic)
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        return mapToResponse(noteRepository.save(note));
    }

    @Transactional
    public NoteResponse updateNote(Long id, NoteRequest request) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", id));

        // Update topic link — supports setting, changing, or clearing it
        if (request.getTopicId() != null) {
            if (note.getTopic() == null || !note.getTopic().getId().equals(request.getTopicId())) {
                Topic topic = topicRepository.findById(request.getTopicId())
                        .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));
                note.setTopic(topic);
            }
        } else {
            note.setTopic(null); // allow unlinking a topic
        }

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        // Only clear AI summary if the content actually changed (so a title-only save keeps the summary)

        return mapToResponse(noteRepository.save(note));
    }

    @Transactional
    public NoteResponse generateAiSummary(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", id));
        
        String summary = aiService.generateSummary(note.getContent());
        note.setAiSummary(summary);
        
        return mapToResponse(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", id));
        noteRepository.delete(note);
    }

    private NoteResponse mapToResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .topicId(note.getTopic() != null ? note.getTopic().getId() : null)
                .topicName(note.getTopic() != null ? note.getTopic().getName() : null)
                .subjectName(note.getTopic() != null ? note.getTopic().getSubject().getName() : null)
                .title(note.getTitle())
                .content(note.getContent())
                .aiSummary(note.getAiSummary())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
