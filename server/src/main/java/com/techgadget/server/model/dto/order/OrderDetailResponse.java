package com.techgadget.server.model.dto.order;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDetailResponse {

    private Long id;
    private Long orderCode;
    private BigDecimal amount;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String shippingAddress;
    private String phoneNumber;
    private LocalDateTime orderDate;

    private String orderStatus;

    private String paymentMethod;
    private String paymentStatus;

    private List<OrderItemResponse> items;
}
