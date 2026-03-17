package com.techgadget.server.service;

import com.techgadget.server.model.dto.order.OrderRequest;

public interface OrderService {
    Object checkoutFromCart(OrderRequest request);

    Object checkoutBuyNow(OrderRequest request);
}
