package com.techgadget.server.service.support;

import com.techgadget.server.model.dto.order.OrderRequest;
import com.techgadget.server.model.dto.order.PendingOrderPayload;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.model.enums.CheckoutType;
import com.techgadget.server.model.enums.PaymentMethod;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class OrderPayloadFactory {

    public PendingOrderPayload buildPendingPayload(
            OrderRequest request,
            Long userId,
            CheckoutType checkoutType,
            BigDecimal total,
            List<PendingOrderPayload.PendingOrderItemPayload> pendingItems
    ) {
        PendingOrderPayload payload = new PendingOrderPayload();
        payload.setUserId(userId);
        payload.setCheckoutType(checkoutType);
        payload.setPaymentMethod(PaymentMethod.QR);
        payload.setShippingAddress(request.getShippingAddress());
        payload.setPhoneNumber(request.getPhoneNumber());
        payload.setOrderEmail(request.getOrderEmail());
        payload.setAmount(total);
        payload.setItems(pendingItems);
        return payload;
    }

    public PendingOrderPayload.PendingOrderItemPayload buildPendingItem(ProductVariant variant, int quantity) {
        PendingOrderPayload.PendingOrderItemPayload payload = new PendingOrderPayload.PendingOrderItemPayload();
        payload.setVariantId(variant.getId());
        payload.setProductName(variant.getProduct().getName());
        payload.setVariantName(variant.getName());
        payload.setPrice(variant.getPrice());
        payload.setQuantity(quantity);
        return payload;
    }
}
