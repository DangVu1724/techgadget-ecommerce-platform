package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.order.OrderDetailResponse;
import com.techgadget.server.model.dto.order.OrderRequest;
import com.techgadget.server.model.dto.order.OrderResponse;
import com.techgadget.server.model.enums.OrderStatus;
import com.techgadget.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(Pageable pageable) {
        return ResponseEntity
                .ok(ApiResponse.success("Orders retrieved successfully.", orderService.getAllOrders(pageable)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(Pageable pageable) {
        return ResponseEntity
                .ok(ApiResponse.success("Orders retrieved successfully.", orderService.getMyOrders(pageable)));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getByStatus(
            @RequestParam OrderStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully.",
                orderService.getOrdersByStatus(status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully.", orderService.getOrderDetail(id)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> payload) {
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully.",
                orderService.updateOrderStatus(id, OrderStatus.CANCELLED)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Order status updated successfully.", orderService.updateOrderStatus(id, status)));
    }

    @PostMapping("/checkout/cart")
    public ResponseEntity<ApiResponse<Object>> checkoutFromCart(@RequestBody OrderRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Checkout completed successfully.", orderService.checkoutFromCart(request)));
    }

    @PostMapping("/checkout/buynow")
    public ResponseEntity<ApiResponse<Object>> checkoutBuyNow(@RequestBody OrderRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Checkout completed successfully.", orderService.checkoutBuyNow(request)));
    }
}
