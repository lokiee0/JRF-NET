package com.jrfos.repository;

import com.jrfos.entity.MockTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MockTestRepository extends JpaRepository<MockTest, Long> {
    List<MockTest> findAllByOrderByTestDateDesc();
}
