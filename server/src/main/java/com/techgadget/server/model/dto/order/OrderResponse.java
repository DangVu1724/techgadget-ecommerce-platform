package com.techgadget.server.model.dto.order;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {

    private Long id;
    private Long orderCode;
    private BigDecimal amount;
    private LocalDateTime orderDate;
    private String orderStatus;
    private String paymentMethod;
    private String paymentStatus;
}
