package com.techgadget.server.service.support;

import com.techgadget.server.model.dto.order.OrderDetailResponse;
import com.techgadget.server.model.dto.order.OrderItemResponse;
import com.techgadget.server.model.dto.order.OrderResponse;
import com.techgadget.server.model.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderCode(order.getOrderCode());
        response.setAmount(order.getAmount());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setOrderDate(order.getOrderDate());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        return response;
    }

    public OrderDetailResponse toDetailResponse(Order order) {
        OrderDetailResponse response = new OrderDetailResponse();
        response.setId(order.getId());
        response.setOrderCode(order.getOrderCode());
        response.setAmount(order.getAmount());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setShippingAddress(order.getShippingAddress());
        response.setPhoneNumber(order.getPhoneNumber());
        response.setOrderDate(order.getOrderDate());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        response.setItems(order.getOrderDetails().stream().map(item -> {
            OrderItemResponse itemResponse = new OrderItemResponse();
            itemResponse.setVariantId(item.getVariant().getId());
            itemResponse.setProductName(item.getVariant().getProduct().getName());
            itemResponse.setVariantName(item.getVariant().getName());
            itemResponse.setPrice(item.getPrice());
            itemResponse.setQuantity(item.getQuantity());
            return itemResponse;
        }).toList());
        return response;
    }
}
