package com.techgadget.server.repository;

import com.techgadget.server.model.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface VariantRepository extends JpaRepository<ProductVariant,Long> {
    @Query("""
    SELECT DISTINCT v FROM ProductVariant v
    LEFT JOIN FETCH v.attributeValues av
    LEFT JOIN FETCH av.attribute
    WHERE v.id = :id
""")
    Optional<ProductVariant> findDetailById(Long id);
}
