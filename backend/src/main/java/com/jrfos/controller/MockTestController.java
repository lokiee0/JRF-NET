package com.jrfos.controller;

import com.jrfos.dto.request.MockTestRequest;
import com.jrfos.dto.response.ApiResponse;
import com.jrfos.dto.response.MockTestResponse;
import com.jrfos.service.MockTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mock-tests")
@RequiredArgsConstructor
public class MockTestController {

    private final MockTestService mockTestService;

    @GetMapping
    public ApiResponse<List<MockTestResponse>> getAllMockTests() {
        return ApiResponse.success(mockTestService.getAllMockTests());
    }

    @GetMapping("/{id}")
    public ApiResponse<MockTestResponse> getMockTestById(@PathVariable Long id) {
        return ApiResponse.success(mockTestService.getMockTestById(id));
    }

    @PostMapping
    public ApiResponse<MockTestResponse> createMockTest(@Valid @RequestBody MockTestRequest request) {
        return ApiResponse.success(mockTestService.createMockTest(request), "Mock test saved successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMockTest(@PathVariable Long id) {
        mockTestService.deleteMockTest(id);
        return ApiResponse.success(null, "Mock test deleted successfully");
    }
}
