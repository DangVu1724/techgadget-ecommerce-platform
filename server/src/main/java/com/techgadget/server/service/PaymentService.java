package com.techgadget.server.service;

import com.techgadget.server.model.dto.order.PendingOrderPayload;
import com.techgadget.server.model.dto.order.PaymentResponse;

public interface PaymentService {
    PaymentResponse createQrPayment(PendingOrderPayload payload);

    PaymentResponse syncQrPayment(String transactionId);
}
