package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.cart.CartItemRequestDTO;
import com.techgadget.server.model.dto.cart.CartResponseDTO;
import com.techgadget.server.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponseDTO>> getCart() {
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully.", cartService.getCart(getCurrentUserEmail())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<Void>> addToCart(@RequestBody CartItemRequestDTO request) {
        cartService.addToCart(getCurrentUserEmail(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart successfully.", null));
    }

    @PutMapping("/items")
    public ResponseEntity<ApiResponse<Void>> updateQuantity(@RequestBody CartItemRequestDTO request) {
        cartService.updateQuantity(getCurrentUserEmail(), request);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully.", null));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable Long cartItemId) {
        cartService.removeFromCart(getCurrentUserEmail(), cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Cart item deleted successfully.", null));
    }
}
