package com.techgadget.server.model.dto.order;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemRequest {

    private Long variantId;
    private Integer quantity;
    private BigDecimal price;
}
