package com.techgadget.server.service;

import com.techgadget.server.model.dto.cart.CartItemRequestDTO;
import com.techgadget.server.model.dto.cart.CartResponseDTO;

public interface CartService {
    CartResponseDTO getCart(String email);

    void addToCart(String email, CartItemRequestDTO request);

    void removeFromCart(String email, Long cartItemId);

    void updateQuantity(String email, CartItemRequestDTO request);
}
