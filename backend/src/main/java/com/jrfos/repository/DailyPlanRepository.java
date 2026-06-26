package com.jrfos.repository;

import com.jrfos.entity.DailyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface DailyPlanRepository extends JpaRepository<DailyPlan, Long> {
    Optional<DailyPlan> findByPlanDate(LocalDate planDate);
}
