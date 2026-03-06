package com.techgadget.server.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private String image;
    private BigDecimal minPrice;
    private Integer totalStock;
    private String categoryName;
    private String brandName;
    private LocalDateTime createdAt;
}
