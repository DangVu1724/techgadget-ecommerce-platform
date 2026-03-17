package com.techgadget.server.model.dto.cart;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CartItemResponseDTO {

    private Long id;
    private Long variantId;

    private String productName;
    private String variantName;

    private BigDecimal price;
    private Integer quantity;

}