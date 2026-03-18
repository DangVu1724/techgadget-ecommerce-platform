package com.techgadget.server.model.dto.cart;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CartResponseDTO {

    private Long id;
    private Long userId;

    private List<CartItemResponseDTO> items;

    private BigDecimal totalPrice;
    private Integer totalItems;

}