package com.techgadget.server.repository;

import com.techgadget.server.model.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VariantRepository extends JpaRepository<ProductVariant,Long> {
}
