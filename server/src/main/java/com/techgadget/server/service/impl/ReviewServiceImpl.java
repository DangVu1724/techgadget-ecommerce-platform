package com.techgadget.server.service.impl;

import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.review.ReviewCreateRequest;
import com.techgadget.server.model.dto.review.ReviewUpdateRequest;
import com.techgadget.server.model.dto.review.ReviewResponse;
import com.techgadget.server.model.entity.Review;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.repository.ReviewRepository;
import com.techgadget.server.repository.UserRepository;
import com.techgadget.server.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public List<ReviewResponse> getReviews(Long productId, Integer rating) {
        if (productId == null) {
            throw new NotFoundException("Product id is required.");
        }

        List<Review> reviews = rating == null
                ? reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                : reviewRepository.findByProductIdAndRatingOrderByCreatedAtDesc(productId, rating);

        return reviews.stream()
                .map(review -> toResponse(review, null))
                .toList();
    }

    @Override
    public ReviewResponse createReview(ReviewCreateRequest request, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new NotFoundException("User context not found.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found."));

        Review review = new Review();
        review.setProductId(request.getProductId());
        review.setUserId(user.getId());
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        Review saved = reviewRepository.save(review);
        return toResponse(saved, user);
    }

    @Override
    public ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found."));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (!review.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own reviews.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        return toResponse(reviewRepository.save(review), user);
    }

    @Override
    public void deleteReview(Long reviewId, String userEmail, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found."));

        if (!isAdmin) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new NotFoundException("User not found."));
            if (!review.getUserId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own reviews.");
            }
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review review, User user) {
        User resolved = user;
        if (resolved == null) {
            resolved = userRepository.findById(review.getUserId()).orElse(null);
        }

        String userName = resolved != null
                ? (resolved.getFullName() != null && !resolved.getFullName().isBlank()
                ? resolved.getFullName()
                : resolved.getEmail())
                : "Customer";

        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .userName(userName)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
