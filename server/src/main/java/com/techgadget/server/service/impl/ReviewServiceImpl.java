package com.techgadget.server.service.impl;

import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.review.ReviewCreateRequest;
import com.techgadget.server.model.dto.review.ReviewPageResponse;
import com.techgadget.server.model.dto.review.ReviewUpdateRequest;
import com.techgadget.server.model.dto.review.ReviewResponse;
import com.techgadget.server.model.dto.review.ReviewSummaryResponse;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.Review;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.repository.ProductRepository;
import com.techgadget.server.repository.ReviewRepository;
import com.techgadget.server.repository.UserRepository;
import com.techgadget.server.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewPageResponse getReviews(Long productId, Integer rating, int page, int size) {
        if (productId == null) {
            throw new NotFoundException("Product id is required.");
        }
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page must be greater than or equal to 0.");
        }
        if (size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Size must be greater than 0.");
        }

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Review> reviewPage = rating == null
                ? reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageRequest)
                : reviewRepository.findByProductIdAndRatingOrderByCreatedAtDesc(productId, rating, pageRequest);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found."));
        List<Review> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

        return ReviewPageResponse.builder()
                .items(reviewPage.getContent().stream()
                        .map(review -> toResponse(review, null))
                        .toList())
                .page(reviewPage.getNumber())
                .size(reviewPage.getSize())
                .totalItems(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .summary(buildSummary(product, allReviews))
                .build();
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
        refreshProductReviewStats(saved.getProductId());
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
        Review updated = reviewRepository.save(review);
        refreshProductReviewStats(updated.getProductId());
        return toResponse(updated, user);
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

        Long productId = review.getProductId();
        reviewRepository.delete(review);
        refreshProductReviewStats(productId);
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

    private void refreshProductReviewStats(Long productId) {
        if (productId == null) {
            return;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found."));
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        long count1 = 0;
        long count2 = 0;
        long count3 = 0;
        long count4 = 0;
        long count5 = 0;
        long totalRating = 0;

        for (Review review : reviews) {
            int rating = review.getRating() == null ? 0 : review.getRating();
            totalRating += rating;

            switch (rating) {
                case 1 -> count1++;
                case 2 -> count2++;
                case 3 -> count3++;
                case 4 -> count4++;
                case 5 -> count5++;
                default -> {
                }
            }
        }

        long totalReviews = reviews.size();
        double averageRating = totalReviews == 0 ? 0 : (double) totalRating / totalReviews;

        product.setAverageRating(averageRating);
        product.setTotalReviews(totalReviews);
        productRepository.save(product);
    }

    private ReviewSummaryResponse buildSummary(Product product, List<Review> reviews) {
        long count1 = 0;
        long count2 = 0;
        long count3 = 0;
        long count4 = 0;
        long count5 = 0;

        for (Review review : reviews) {
            int rating = review.getRating() == null ? 0 : review.getRating();

            switch (rating) {
                case 1 -> count1++;
                case 2 -> count2++;
                case 3 -> count3++;
                case 4 -> count4++;
                case 5 -> count5++;
                default -> {
                }
            }
        }

        return ReviewSummaryResponse.builder()
                .averageRating(product.getAverageRating() == null ? 0 : product.getAverageRating())
                .totalReviews(product.getTotalReviews() == null ? 0 : product.getTotalReviews())
                .count1(count1)
                .count2(count2)
                .count3(count3)
                .count4(count4)
                .count5(count5)
                .build();
    }
}
