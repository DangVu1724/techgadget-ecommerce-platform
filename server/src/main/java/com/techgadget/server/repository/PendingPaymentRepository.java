package com.techgadget.server.repository;

import com.techgadget.server.model.entity.PendingPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PendingPaymentRepository extends JpaRepository<PendingPayment, Long> {
    Optional<PendingPayment> findByTransactionId(String transactionId);

    Optional<PendingPayment> findByOrderCode(Long orderCode);
}
