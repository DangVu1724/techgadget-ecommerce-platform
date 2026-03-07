package com.techgadget.server.model.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private String image;
    private BigDecimal minPrice;
    private Long totalStock;
    private String categoryName;
    private String brandName;
    private LocalDateTime createdAt;


}
