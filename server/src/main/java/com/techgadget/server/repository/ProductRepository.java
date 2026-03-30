package com.techgadget.server.repository;

import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.entity.Product;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
WHERE LOWER(CAST(p.name AS text)) LIKE LOWER(CONCAT('%', CAST(:name AS text), '%'))
GROUP BY p.id, p.name, p.image, c.name, b.brandName,p.createdAt
""")
    Page<ProductSummaryResponse> findProductSummaryByName(@Param("name") String name, Pageable pageable);

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

// Thêm tham số keyword vào @Query filterProducts
    @Query("""
SELECT new com.techgadget.server.model.dto.product.ProductSummaryResponse(
    p.id,
    p.name,
    p.image,
    MIN(v.price),
    COALESCE(SUM(v.stock),0),
    c.name,
    b.brandName,
    p.createdAt
)
FROM Product p
LEFT JOIN p.category c
LEFT JOIN p.brand b
LEFT JOIN p.variants v

WHERE (:brandId IS NULL OR b.id = :brandId)
AND (:categoryId IS NULL OR c.id = :categoryId)

AND (:minPrice IS NULL OR v.price >= :minPrice)
AND (:maxPrice IS NULL OR v.price <= :maxPrice)

AND (
    :keyword IS NULL 
    OR LOWER(CAST(p.name AS text)) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
    OR LOWER(CAST(b.brandName AS text)) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
)

AND (
    :ram IS NULL OR EXISTS (
        SELECT 1
        FROM VariantAttributeValue vav
        JOIN vav.attribute a
        WHERE vav.variant = v
        AND a.attributeName = 'RAM'
        AND vav.value = :ram
    )
)

AND (
    :storage IS NULL OR EXISTS (
        SELECT 1
        FROM VariantAttributeValue vav2
        JOIN vav2.attribute a2
        WHERE vav2.variant = v
        AND a2.attributeName = 'Storage'
        AND CAST(vav2.value AS text) LIKE CONCAT('%', CAST(:storage AS text), '%')
                               )
)

GROUP BY p.id, p.name, p.image, c.name, b.brandName, p.createdAt
""")
    Page<ProductSummaryResponse> filterProducts(
            Pageable pageable,
            @Param("keyword") String keyword, // Thêm dòng này
            @Param("brandId") Long brandId,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("ram") String ram,
            @Param("storage") String storage
    );

    boolean existsByName(@NotBlank(message = "Tên sản phẩm không được để trống") String name);
}
