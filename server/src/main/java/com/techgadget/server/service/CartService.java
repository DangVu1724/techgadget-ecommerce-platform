package com.techgadget.server.service;

import com.techgadget.server.model.dto.cart.CartItemRequestDTO;
import com.techgadget.server.model.dto.cart.CartResponseDTO;

public interface CartService {
    CartResponseDTO getCart(Long userId);

    void addToCart(Long userId, CartItemRequestDTO request);

    void removeFromCart(Long cartItemId);

    void updateQuantity(Long userId, CartItemRequestDTO request);
}
