package com.techgadget.server.service;

import com.techgadget.server.model.dto.order.OrderDetailResponse;
import com.techgadget.server.model.dto.order.OrderRequest;
import com.techgadget.server.model.dto.order.OrderResponse;
import com.techgadget.server.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    Page<OrderResponse> getAllOrders(Pageable pageable);
    Page<OrderResponse> getMyOrders(Pageable pageable);

    Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable);

    OrderDetailResponse getOrderDetail(Long orderId);

    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);

    Object checkoutFromCart(OrderRequest request);

    Object checkoutBuyNow(OrderRequest request);
}
