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
}
