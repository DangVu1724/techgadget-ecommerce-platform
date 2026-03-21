package com.techgadget.server.model.dto.order;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemResponse {

    private Long variantId;
    private String productName;
    private String variantName;

    private BigDecimal price;
    private Integer quantity;
}
