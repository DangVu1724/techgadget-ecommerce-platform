package com.techgadget.server.model.dto.cart;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemRequestDTO {

    private Long variantId;
    private Integer quantity;

}