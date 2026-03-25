package com.techgadget.server.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.order.PaymentResponse;
import com.techgadget.server.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PayOS payOS;
    private final PaymentService paymentService;

    @PostMapping(path = "/qr/webhook")
    public ResponseEntity<ApiResponse<WebhookData>> qrTransferHandler(@RequestBody Object body)
            throws JsonProcessingException, IllegalArgumentException {
        try {
            WebhookData data = payOS.webhooks().verify(body);
            paymentService.syncQrPayment(data.getOrderCode().toString());
            System.out.println("QR payment completed: " + data);
            return ResponseEntity.ok(ApiResponse.success("Webhook delivered", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), null));
        }
    }

    @GetMapping("/qr/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getQrStatus(@PathVariable String transactionId) {
        return ResponseEntity.ok(
                ApiResponse.success("QR payment status retrieved successfully.", paymentService.syncQrPayment(transactionId))
        );
    }
}
