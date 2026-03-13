package com.techgadget.server.model.dto.cart;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CartResponseDTO {

    private Long id;
    private Long userId;

    private List<CartItemResponseDTO> items;

    private Double totalPrice;
    private Integer totalItems;

}