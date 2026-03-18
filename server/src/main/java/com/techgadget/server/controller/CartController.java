package com.techgadget.server.controller;

import com.techgadget.server.model.dto.cart.CartItemRequestDTO;
import com.techgadget.server.model.dto.cart.CartResponseDTO;
import com.techgadget.server.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Lấy email từ JWT
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    // ===== GET CART =====
    @GetMapping
    public CartResponseDTO getCart() {
        return cartService.getCart(getCurrentUserEmail());
    }

    // ===== ADD TO CART =====
    @PostMapping("/items")
    public Object addToCart(@RequestBody CartItemRequestDTO request) {
        cartService.addToCart(getCurrentUserEmail(), request);
        return java.util.Map.of("message", "Added to cart");
    }

    // ===== UPDATE =====
    @PutMapping("/items")
    public Object updateQuantity(@RequestBody CartItemRequestDTO request) {
        cartService.updateQuantity(getCurrentUserEmail(), request);
        return java.util.Map.of("message", "Updated");
    }

    // ===== DELETE ITEM =====
    @DeleteMapping("/items/{cartItemId}")
    public Object removeItem(@PathVariable Long cartItemId) {
        cartService.removeFromCart(getCurrentUserEmail(), cartItemId);
        return java.util.Map.of("message", "Deleted");
    }
}