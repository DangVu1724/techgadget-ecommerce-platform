package com.techgadget.server.repository;

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
SELECT DISTINCT p
FROM Product p
LEFT JOIN FETCH p.variants
LEFT JOIN FETCH p.category
LEFT JOIN FETCH p.brand
""")
    List<Product> findAllWithDetails();
}
