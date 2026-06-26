package com.jrfos.controller;

import com.jrfos.dto.response.AnalyticsResponse;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ApiResponse<AnalyticsResponse> getDashboardAnalytics() {
        return ApiResponse.success(analyticsService.getDashboardAnalytics());
    }
}
