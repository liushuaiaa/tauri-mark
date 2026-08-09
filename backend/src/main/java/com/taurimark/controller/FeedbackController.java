package com.taurimark.controller;

import com.taurimark.dto.ApiResponse;
import com.taurimark.entity.Feedback;
import com.taurimark.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getName());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Feedback>>> getList() {
        List<Feedback> list = feedbackService.getFeedbacks(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/query/{id}")
    public ResponseEntity<ApiResponse<Feedback>> getFeedback(@PathVariable Long id) {
        Feedback feedback = feedbackService.getFeedback(id, getCurrentUserId());
        if (feedback == null) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "反馈不存在"));
        }
        return ResponseEntity.ok(ApiResponse.success(feedback));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Feedback>> createFeedback(@RequestBody Feedback feedback) {
        feedbackService.saveFeedback(feedback, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(feedback));
    }

    @PostMapping("/edit")
    public ResponseEntity<ApiResponse<Feedback>> updateFeedback(@RequestBody Feedback feedback) {
        if (feedback.getId() == null) {
            return ResponseEntity.status(400).body(ApiResponse.error(400, "ID不能为空"));
        }
        feedbackService.saveFeedback(feedback, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(feedback));
    }

    @PostMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }
}
