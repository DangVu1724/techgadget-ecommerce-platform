package com.techgadget.server.model.dto.product;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;


@Data
@AllArgsConstructor
public class TopProductResponse {
    private Long id;
    private String name;
    private String image;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private Long totalSold;
    private Double averageRating;
    private Long totalReviews;

}
