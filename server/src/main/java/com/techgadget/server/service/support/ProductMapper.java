package com.techgadget.server.service.support;

import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.dto.product.ProductResponse;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.dto.variant.VariantAttributeResponse;
import com.techgadget.server.model.dto.variant.VariantResponse;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.ProductVariant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Objects;

@Component
public class ProductMapper {

    public ProductSummaryResponse toProductSummary(Product product) {
        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .image(product.getImage())
                .minPrice(product.getVariants().stream()
                        .map(ProductVariant::getPrice)
                        .filter(Objects::nonNull)
                        .min(BigDecimal::compareTo)
                        .orElse(BigDecimal.ZERO))
                .totalStock(product.getVariants().stream()
                        .map(ProductVariant::getStock)
                        .filter(Objects::nonNull)
                        .mapToLong(Integer::longValue)
                        .sum())
                .totalSold(product.getTotalSold())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getBrandName() : null)
                .createdAt(product.getCreatedAt())
                .averageRating(product.getAverageRating())
                .totalReviews(product.getTotalReviews())
                .build();
    }

    public ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .image(product.getImage())
                .createdAt(product.getCreatedAt())
                .category(CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .build())
                .brand(BrandResponse.builder()
                        .brandId(product.getBrand().getBrandId())
                        .brandName(product.getBrand().getBrandName())
                        .build())
                .variants(product.getVariants().stream()
                        .map(v -> VariantResponse.builder()
                                .id(v.getId())
                                .name(v.getName())
                                .sku(v.getSku())
                                .price(v.getPrice())
                                .stock(v.getStock())
                                .description(v.getDescription())
                                .attributes(v.getAttributeValues().stream()
                                        .map(av -> VariantAttributeResponse.builder()
                                                .attributeId(av.getAttribute().getAttributeId())
                                                .attributeName(av.getAttribute().getAttributeName())
                                                .value(av.getValue())
                                                .build())
                                        .toList())
                                .build())
                        .toList())
                .minPrice(product.getVariants().stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO))
                .maxPrice(product.getVariants().stream().map(ProductVariant::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO))
                .totalStock(product.getVariants().stream().mapToInt(ProductVariant::getStock).sum())
                .averageRating(product.getAverageRating())
                .totalReviews(product.getTotalReviews())
                .build();
    }
}
