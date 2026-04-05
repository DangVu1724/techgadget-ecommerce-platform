package com.techgadget.server.service;

import com.techgadget.server.model.dto.review.ReviewCreateRequest;
import com.techgadget.server.model.dto.review.ReviewUpdateRequest;
import com.techgadget.server.model.dto.review.ReviewResponse;

import java.util.List;

public interface ReviewService {
    List<ReviewResponse> getReviews(Long productId, Integer rating);
    ReviewResponse createReview(ReviewCreateRequest request, String userEmail);
    ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request, String userEmail);
    void deleteReview(Long reviewId, String userEmail, boolean isAdmin);
}
