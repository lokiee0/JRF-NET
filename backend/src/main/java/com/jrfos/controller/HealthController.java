package com.jrfos.controller;

import com.jrfos.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check controller to verify the backend is running.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    /**
     * Returns a health status message confirming the backend is operational.
     *
     * @return success response with status message
     */
    @GetMapping
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("JRF OS Backend is running"));
    }
}
