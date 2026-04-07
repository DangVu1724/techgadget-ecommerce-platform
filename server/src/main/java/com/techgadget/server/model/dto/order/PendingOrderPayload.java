package com.techgadget.server.model.dto.order;

import com.techgadget.server.model.enums.CheckoutType;
import com.techgadget.server.model.enums.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PendingOrderPayload {
    private Long userId;
    private CheckoutType checkoutType;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private String shippingCity;
    private String shippingWard;
    private String phoneNumber;
    private String orderEmail;
    private BigDecimal amount;
    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;
    private List<PendingOrderItemPayload> items;

    @Data
    public static class PendingOrderItemPayload {
        private Long variantId;
        private String productName;
        private String variantName;
        private BigDecimal price;
        private Integer quantity;
    }
}
