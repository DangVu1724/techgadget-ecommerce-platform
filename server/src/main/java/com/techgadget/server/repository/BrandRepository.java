package com.techgadget.server.repository;

import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.model.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    @Query("""
SELECT DISTINCT b
FROM Product p
JOIN p.category c
JOIN p.brand b
WHERE c.id = :categoryId
""")
    List<Brand> getBrandsByCategory(Long categoryId);
}
