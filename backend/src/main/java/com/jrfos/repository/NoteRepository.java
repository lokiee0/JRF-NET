package com.jrfos.repository;

import com.jrfos.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByTopicIdOrderByUpdatedAtDesc(Long topicId);

    List<Note> findAllByOrderByUpdatedAtDesc();

    List<Note> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByUpdatedAtDesc(String title, String content);
}
