package com.techgadget.server.model.dto.order;

import lombok.Data;

@Data
public class PaymentResponse {
    private String paymentUrl;
    private String transactionId;
}
