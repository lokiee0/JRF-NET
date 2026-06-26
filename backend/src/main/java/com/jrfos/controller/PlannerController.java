package com.jrfos.controller;

import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.DailyPlanResponse;
import com.jrfos.service.PlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
public class PlannerController {

    private final PlannerService plannerService;

    @GetMapping("/today")
    public ApiResponse<DailyPlanResponse> getPlanForToday() {
        DailyPlanResponse plan = plannerService.getPlanForDate(LocalDate.now());
        return ApiResponse.success(plan); // Will be null if not generated yet
    }

    @PostMapping("/generate")
    public ApiResponse<DailyPlanResponse> generatePlanForToday() {
        return ApiResponse.success(plannerService.generatePlanForToday(), "Plan generated successfully");
    }

    @PatchMapping("/plans/{planId}/items/{itemId}/toggle")
    public ApiResponse<DailyPlanResponse> toggleTaskCompletion(
            @PathVariable Long planId,
            @PathVariable Long itemId,
            @RequestParam boolean completed) {
        return ApiResponse.success(plannerService.toggleTaskCompletion(planId, itemId, completed));
    }

    @DeleteMapping("/today")
    public ApiResponse<Void> deletePlanForToday() {
        plannerService.deletePlanForToday();
        return ApiResponse.success(null, "Plan deleted successfully");
    }
}
