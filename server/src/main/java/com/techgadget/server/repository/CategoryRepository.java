package com.techgadget.server.repository;

import com.techgadget.server.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByNameContainingIgnoreCase(String name);

    @Query("""
SELECT DISTINCT c
FROM Product p
JOIN p.category c
JOIN p.brand b
WHERE b.id = :brandId
""")
    List<Category> getCategoriesByBrand(Long brandId);
}
