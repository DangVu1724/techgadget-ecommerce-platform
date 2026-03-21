package com.techgadget.server.service;

import com.techgadget.server.model.dto.order.PendingOrderPayload;
import com.techgadget.server.model.dto.order.PaymentResponse;

public interface PaymentService {
    PaymentResponse createPayOSPayment(PendingOrderPayload payload);

    PaymentResponse syncPayOSPayment(String transactionId);
}
