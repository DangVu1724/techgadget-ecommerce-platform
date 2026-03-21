package com.techgadget.server.model.entity;

import com.techgadget.server.model.enums.PendingPaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "pending_payments")
@Getter
@Setter
public class PendingPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long orderCode;

    @Column(unique = true, nullable = false)
    private String transactionId;

    private Long userId;

    private String paymentLinkId;

    private Long createdOrderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PendingPaymentStatus status;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String payloadJson;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
