package com.techgadget.server.model.dto.product;

import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.dto.attributeValue.ProductAttributeValueResponse;
import com.techgadget.server.model.dto.variant.VariantResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String image;
    private LocalDateTime createdAt;

    private CategoryResponse category;
    private BrandResponse brand;

    private List<VariantResponse> variants;
    private List<ProductAttributeValueResponse> attributes;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer totalStock;
}