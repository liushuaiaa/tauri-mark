package com.taurimark.service;

import com.taurimark.entity.Feedback;
import com.taurimark.mapper.FeedbackMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackMapper feedbackMapper;

    public FeedbackService(FeedbackMapper feedbackMapper) {
        this.feedbackMapper = feedbackMapper;
    }

    public List<Feedback> getFeedbacks(Long userId) {
        return feedbackMapper.findByUserId(userId);
    }

    public Feedback getFeedback(Long id, Long userId) {
        return feedbackMapper.findByIdAndUserId(id, userId);
    }

    public void saveFeedback(Feedback feedback, Long userId) {
        if (feedback.getId() == null) {
            feedback.setUserId(userId);
            feedback.setStatus("PENDING");
            feedback.setCreatedAt(System.currentTimeMillis());
            feedback.setUpdatedAt(System.currentTimeMillis());
            feedbackMapper.insert(feedback);
        } else {
            Feedback existing = feedbackMapper.findByIdAndUserId(feedback.getId(), userId);
            if (existing == null) return;
            feedback.setUserId(userId);
            feedback.setUpdatedAt(System.currentTimeMillis());
            feedbackMapper.update(feedback);
        }
    }

    public void deleteFeedback(Long id, Long userId) {
        feedbackMapper.delete(id, userId);
    }
}
