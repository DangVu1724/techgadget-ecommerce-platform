package com.techgadget.server.model.dto.variant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private Long productId;
    private String productName;
}