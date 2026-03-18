package com.techgadget.server.controller;

import com.techgadget.server.model.dto.order.OrderRequest;
import com.techgadget.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout/cart")
    public ResponseEntity<?> checkoutFromCart(
            @RequestBody OrderRequest request
    ) {
        return ResponseEntity.ok(orderService.checkoutFromCart(request));
    }

    @PostMapping("/checkout/buynow")
    public ResponseEntity<?> checkoutBuyNow(
            @RequestBody OrderRequest request
    ) {
        return ResponseEntity.ok(orderService.checkoutBuyNow(request));
    }
}