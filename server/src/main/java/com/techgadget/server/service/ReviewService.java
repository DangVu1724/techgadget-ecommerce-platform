package com.techgadget.server.service;

import com.techgadget.server.model.dto.review.ReviewCreateRequest;
import com.techgadget.server.model.dto.review.ReviewPageResponse;
import com.techgadget.server.model.dto.review.ReviewUpdateRequest;
import com.techgadget.server.model.dto.review.ReviewResponse;

public interface ReviewService {
    ReviewPageResponse getReviews(Long productId, Integer rating, int page, int size);
    ReviewResponse createReview(ReviewCreateRequest request, String userEmail);
    ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request, String userEmail);
    void deleteReview(Long reviewId, String userEmail, boolean isAdmin);
}
