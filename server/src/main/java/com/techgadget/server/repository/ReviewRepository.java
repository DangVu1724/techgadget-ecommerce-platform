package com.techgadget.server.repository;

import com.techgadget.server.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByProductIdAndRatingOrderByCreatedAtDesc(Long productId, Integer rating);
}
