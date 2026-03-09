package com.techgadget.server.repository;

import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.entity.Product;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    @Query("""
SELECT new com.techgadget.server.model.dto.product.ProductSummaryResponse(
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

    @Query("""
SELECT DISTINCT p FROM Product p
LEFT JOIN FETCH p.category
LEFT JOIN FETCH p.brand
LEFT JOIN FETCH p.variants v
LEFT JOIN FETCH v.attributeValues av
LEFT JOIN FETCH av.attribute
WHERE p.id = :id
""")
    Optional<Product> findProductDetail(Long id);

    boolean existsByName(@NotBlank(message = "Tên sản phẩm không được để trống") String name);
}
