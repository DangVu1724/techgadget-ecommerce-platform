package com.techgadget.server.service.impl;

import com.techgadget.server.model.dto.order.*;
import com.techgadget.server.model.entity.*;
import com.techgadget.server.model.enums.*;
import com.techgadget.server.repository.CartRepository;
import com.techgadget.server.repository.OrderRepository;
import com.techgadget.server.repository.UserRepository;
import com.techgadget.server.repository.VariantRepository;
import com.techgadget.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final VariantRepository variantRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;


    // CART FLOW
    @Override
    public Object checkoutFromCart(OrderRequest request) {

        User user = getCurrentUser();

        Cart cart = cartRepository.findCartWithItems(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Order order = buildBaseOrder(request);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();

        for (CartItem item : cart.getItems()) {

            ProductVariant variant = item.getVariant();

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setVariant(variant);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(variant.getPrice());

            total = total.add(
                    variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
            );

            details.add(detail);
        }

        order.setOrderDetails(details);
        order.setAmount(total);
        order.setUser(user);

        Order saved = orderRepository.save(order);

        // 🧹 clear cart sau khi đặt
        cart.getItems().clear();
        cartRepository.save(cart);

        return handlePayment(saved);
    }

    // ⚡ BUY NOW FLOW
    @Override
    public Object checkoutBuyNow(OrderRequest request) {

        Order order = buildBaseOrder(request);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();

        for (OrderItemRequest item : request.getItems()) {

            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setVariant(variant);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(variant.getPrice());

            total = total.add(
                    variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
            );

            details.add(detail);
        }

        order.setOrderDetails(details);
        order.setAmount(total);

        Order saved = orderRepository.save(order);

        return handlePayment(saved);
    }

    // Tạo base Order chung
    private Order buildBaseOrder(OrderRequest request) {

        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setOrderEmail(request.getOrderEmail());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);

        return order;
    }

    //Handle payment chung
    private Object handlePayment(Order order) {

        if (order.getPaymentMethod() == PaymentMethod.COD) {
            return mapToResponse(order);
        }

        PaymentResponse res = new PaymentResponse();
        res.setTransactionId("TXN_" + order.getId());
        res.setPaymentUrl("https://sandbox.vnpay.vn/pay?txn=" + order.getId());

        return res;
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse res = new OrderResponse();
        res.setId(order.getId());
        res.setAmount(order.getAmount());
        res.setOrderStatus(order.getOrderStatus().name());
        res.setPaymentMethod(order.getPaymentMethod().name());
        res.setPaymentStatus(order.getPaymentStatus().name());
        return res;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}