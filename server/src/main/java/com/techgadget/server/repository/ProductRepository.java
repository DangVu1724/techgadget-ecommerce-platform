package com.techgadget.server.repository;

import com.techgadget.server.model.dto.ProductSummaryResponse;
import com.techgadget.server.model.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    @Query("""
SELECT new com.techgadget.server.model.dto.ProductSummaryResponse(
    p.id,
    p.name,
    p.image,
    MIN(v.price),
    SUM(v.stock),
    c.name,
    b.brandName,
    p.createdAt
)
FROM Product p
LEFT JOIN p.category c
LEFT JOIN p.brand b
LEFT JOIN p.variants v
GROUP BY p.id, p.name, p.image, c.name, b.brandName,p.createdAt
""")
    Page<ProductSummaryResponse> findProductSummary(Pageable pageable);
}
