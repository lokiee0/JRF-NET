package com.jrfos.repository;

import com.jrfos.entity.Resource;
import com.jrfos.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByTopicIdOrderByCreatedAtDesc(Long topicId);

    List<Resource> findAllByOrderByCreatedAtDesc();
    
    List<Resource> findByResourceTypeOrderByCreatedAtDesc(ResourceType type);
}
