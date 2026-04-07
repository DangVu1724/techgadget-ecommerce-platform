package com.techgadget.server.model.dto.product;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private String image;
    private BigDecimal minPrice;
    private Long totalStock;
    private Integer totalSold;
    private String categoryName;
    private String brandName;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Long totalReviews;

    public ProductSummaryResponse(
            Long id,
            String name,
            String image,
            BigDecimal minPrice,
            Long totalStock,
            Integer totalSold,
            String categoryName,
            String brandName,
            LocalDateTime createdAt,
            Double averageRating,
            Long totalReviews
    ) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.minPrice = minPrice;
        this.totalStock = totalStock;
        this.totalSold = totalSold;
        this.categoryName = categoryName;
        this.brandName = brandName;
        this.createdAt = createdAt;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }
}
