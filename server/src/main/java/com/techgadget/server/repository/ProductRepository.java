package com.techgadget.server.repository;

import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.entity.Product;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
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
GROUP BY p.id, p.name, p.image, c.name, b.brandName, p.createdAt
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
GROUP BY p.id, p.name, p.image, c.name, b.brandName, p.createdAt
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
    Optional<Product> findProductDetail(@Param("id") Long id);

    @Query("""
SELECT new com.techgadget.server.model.dto.product.ProductSummaryResponse(
    p.id,
    p.name,
    p.image,
    MIN(v.price),
    COALESCE(SUM(v.stock), 0),
    c.name,
    b.brandName,
    p.createdAt
)
FROM Product p
JOIN p.variants v
LEFT JOIN p.category c
LEFT JOIN p.brand b
WHERE p.id <> :currentProductId
GROUP BY p.id, p.name, p.image, c.name, b.brandName, p.createdAt, c.id, b.brandId
HAVING COALESCE(SUM(v.stock), 0) > 0
ORDER BY CASE
    WHEN :categoryId IS NOT NULL AND :brandId IS NOT NULL AND c.id = :categoryId AND b.brandId = :brandId THEN 1
    WHEN :categoryId IS NOT NULL AND c.id = :categoryId THEN 2
    ELSE 3
END ASC,
p.createdAt DESC
""")
    List<ProductSummaryResponse> findRelatedProductsByPriority(
            @Param("currentProductId") Long currentProductId,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            Pageable pageable
    );

    @Query("""
SELECT DISTINCT
    a.attributeId AS attributeId,
    a.attributeName AS attributeName,
    vav.value AS value
FROM VariantAttributeValue vav
JOIN vav.attribute a
JOIN vav.variant v
JOIN v.product p
WHERE p.category.id = :categoryId
AND (:brandId IS NULL OR p.brand.brandId = :brandId)
AND a.attributeId IN :attributeIds
""")
    List<ProductFilterAttributeValueView> findDistinctAttributeValues(
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("attributeIds") Collection<Long> attributeIds
    );

    @Override
    @EntityGraph(attributePaths = {"category", "brand", "variants"})
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    boolean existsByName(@NotBlank(message = "Tên sản phẩm không được để trống") String name);
}
