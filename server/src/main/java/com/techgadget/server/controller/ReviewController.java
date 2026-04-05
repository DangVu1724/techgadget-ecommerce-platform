package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.review.ReviewCreateRequest;
import com.techgadget.server.model.dto.review.ReviewUpdateRequest;
import com.techgadget.server.model.dto.review.ReviewResponse;
import com.techgadget.server.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
@CrossOrigin
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer rating
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Reviews retrieved successfully.",
                reviewService.getReviews(productId, rating)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewCreateRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized.", null));
        }

        return ResponseEntity.ok(ApiResponse.success(
                "Review created successfully.",
                reviewService.createReview(request, authentication.getName())
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest request,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized.", null));
        }
        return ResponseEntity.ok(ApiResponse.success(
                "Review updated successfully.",
                reviewService.updateReview(id, request, authentication.getName())
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized.", null));
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
        reviewService.deleteReview(id, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully.", null));
    }
}
