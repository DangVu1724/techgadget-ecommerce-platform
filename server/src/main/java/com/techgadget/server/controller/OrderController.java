package com.techgadget.server.controller;

import com.techgadget.server.model.dto.order.OrderDetailResponse;
import com.techgadget.server.model.dto.order.OrderRequest;
import com.techgadget.server.model.dto.order.OrderResponse;
import com.techgadget.server.model.enums.OrderStatus;
import com.techgadget.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @GetMapping("/status")
    public Page<OrderResponse> getByStatus(
            @RequestParam OrderStatus status,
            Pageable pageable
    ) {
        return orderService.getOrdersByStatus(status, pageable);
    }

    @GetMapping("/{id}")
    public OrderDetailResponse getDetail(@PathVariable Long id) {
        return orderService.getOrderDetail(id);
    }

    // update trạng thái đơn
    @PutMapping("/{id}/status")
    public OrderResponse updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        return orderService.updateOrderStatus(id, status);
    }

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