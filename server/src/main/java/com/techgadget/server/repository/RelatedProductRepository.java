package com.techgadget.server.repository;

import com.techgadget.server.model.entity.RelatedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RelatedProductRepository extends JpaRepository<RelatedProduct, Long> {

    List<RelatedProduct> findByProductIdOrderByDisplayOrderAsc(Long productId);

    long countByProductId(Long productId);

    boolean existsByProductIdAndRelatedProductId(Long productId, Long relatedProductId);

    Optional<RelatedProduct> findTopByProductIdOrderByDisplayOrderDesc(Long productId);

    List<RelatedProduct> findByProductIdAndDisplayOrderGreaterThanOrderByDisplayOrderAsc(Long productId, Integer displayOrder);
}
