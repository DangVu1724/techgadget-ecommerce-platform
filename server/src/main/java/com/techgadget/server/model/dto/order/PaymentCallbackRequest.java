package com.techgadget.server.model.dto.order;

import lombok.Data;

@Data
public class PaymentCallbackRequest {
    private String transactionId;
    private String status;
}
