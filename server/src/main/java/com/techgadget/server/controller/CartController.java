package com.techgadget.server.controller;

import com.techgadget.server.model.dto.cart.CartItemRequestDTO;
import com.techgadget.server.model.dto.cart.CartResponseDTO;
import com.techgadget.server.repository.CartItemRepository;
import com.techgadget.server.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    // Lấy giỏ hàng của user
    @GetMapping("/{userId}")
    public CartResponseDTO getCart(@PathVariable Long userId) {
        return cartService.getCart(userId);
    }

    // Thêm sản phẩm vào giỏ
    @PostMapping("/{userId}/items")
    public void addToCart(
            @PathVariable Long userId,
            @RequestBody CartItemRequestDTO request
    ) {
        cartService.addToCart(userId, request);
    }

    // Update số lượng sản phẩm
    @PutMapping("/{userId}/items")
    public void updateQuantity(
            @PathVariable Long userId,
            @RequestBody CartItemRequestDTO request
    ) {
        cartService.updateQuantity(userId, request);
    }

    // Xóa item khỏi cart
    @DeleteMapping("/item/{cartItemId}")
    public void removeItem(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
    }
}
