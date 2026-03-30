package com.techgadget.server.service.support;

import com.techgadget.server.exception.BadRequestException;
import com.techgadget.server.model.enums.OrderStatus;
import org.springframework.stereotype.Component;

@Component
public class OrderStatusValidator {

    public void validateTransition(OrderStatus oldStatus, OrderStatus newStatus) {
        if (oldStatus == OrderStatus.DELIVERED || oldStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Completed or cancelled orders cannot be updated.");
        }

        if (oldStatus == OrderStatus.PENDING
                && newStatus != OrderStatus.CONFIRMED
                && newStatus != OrderStatus.CANCELLED) {
            throw new BadRequestException("PENDING orders can only move to CONFIRMED or CANCELLED.");
        }

        if (oldStatus == OrderStatus.PROCESSING
                && newStatus != OrderStatus.SHIPPING
                && newStatus != OrderStatus.CANCELLED) {
            throw new BadRequestException("PROCESSING orders can only move to SHIPPING or CANCELLED.");
        }

        if (oldStatus == OrderStatus.SHIPPING && newStatus != OrderStatus.DELIVERED) {
            throw new BadRequestException("SHIPPING orders can only move to DELIVERED.");
        }

        if (oldStatus == OrderStatus.CONFIRMED
                && newStatus != OrderStatus.PROCESSING
                && newStatus != OrderStatus.CANCELLED) {
            throw new BadRequestException("CONFIRMED orders can only move to PROCESSING or CANCELLED.");
        }

        if ((oldStatus == OrderStatus.PROCESSING || oldStatus == OrderStatus.SHIPPING)
                && newStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Orders cannot be cancelled after processing has started.");
        }
    }
}
