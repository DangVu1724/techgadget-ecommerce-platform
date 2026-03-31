package com.techgadget.server.model.dto.order;

import com.techgadget.server.model.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotBlank
    private String shippingAddress;
    @NotBlank
    private String phoneNumber;
    @NotBlank
    private String orderEmail;

    private PaymentMethod paymentMethod; // COD | QR
    private List<OrderItemRequest> items;

    private String couponCode;

    private java.math.BigDecimal amount;
    private java.math.BigDecimal discountAmount;
    private java.math.BigDecimal finalAmount;
}
