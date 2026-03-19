package com.techgadget.server.service.impl;

import com.techgadget.server.model.dto.order.*;
import com.techgadget.server.model.entity.*;
import com.techgadget.server.model.enums.*;
import com.techgadget.server.repository.*;
import com.techgadget.server.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final OrderDetailRepository orderDetailRepository;


    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByOrderStatus(status, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public OrderDetailResponse getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return mapToDetailResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        validateStatusTransition(order.getOrderStatus(), newStatus);

        if (newStatus == OrderStatus.CANCELLED) {
            if (order.getOrderStatus() == OrderStatus.PENDING ||
                    order.getOrderStatus() == OrderStatus.CONFIRMED) {
                for (OrderDetail item : order.getOrderDetails()) {
                    variantRepository.releaseStock(
                            item.getVariant().getId(),
                            item.getQuantity()
                    );
                }

            }

        }

        if (newStatus == OrderStatus.PROCESSING) {

            for (OrderDetail item : order.getOrderDetails()) {
                variantRepository.confirmStock(
                        item.getVariant().getId(),
                        item.getQuantity()
                );
            }
        }

        if (newStatus == OrderStatus.DELIVERED) {

            if (order.getPaymentMethod() == PaymentMethod.COD) {
                order.setPaymentStatus(PaymentStatus.PAID);
            }

        }

        order.setOrderStatus(newStatus);
        orderRepository.save(order);

        return mapToResponse(order);
    }

    private void validateStatusTransition(OrderStatus oldStatus, OrderStatus newStatus) {

        if (oldStatus == OrderStatus.DELIVERED || oldStatus == OrderStatus.CANCELLED) {
            throw new RuntimeException("Không thể cập nhật đơn đã hoàn thành / đã hủy");
        }

        if (oldStatus == OrderStatus.PENDING && newStatus != OrderStatus.CONFIRMED && newStatus != OrderStatus.CANCELLED) {
            throw new RuntimeException("PENDING chỉ được sang CONFIRMED hoặc CANCELLED");
        }

        if (oldStatus == OrderStatus.PROCESSING && newStatus != OrderStatus.SHIPPING && newStatus != OrderStatus.CANCELLED) {
            throw new RuntimeException("PROCESSING chỉ được sang SHIPPING hoặc CANCELLED");
        }

        if (oldStatus == OrderStatus.SHIPPING && newStatus != OrderStatus.DELIVERED) {
            throw new RuntimeException("SHIPPING chỉ được sang DELIVERED");
        }

        if (oldStatus == OrderStatus.CONFIRMED &&
                newStatus != OrderStatus.PROCESSING &&
                newStatus != OrderStatus.CANCELLED) {
            throw new RuntimeException("CONFIRMED chỉ được sang PROCESSING hoặc CANCELLED");
        }

        if (oldStatus == OrderStatus.PROCESSING || oldStatus == OrderStatus.SHIPPING) {

            if (newStatus == OrderStatus.CANCELLED) {
                throw new RuntimeException("Không thể huỷ đơn sau khi đã xử lý");
            }
        }
    }

    @Transactional
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

            int updated = variantRepository.reserveStock(variant.getId(), item.getQuantity());

            if(updated == 0) {
                throw new RuntimeException("San pham het hang");
            }

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

        //clear cart sau khi đặt
        cart.getItems().clear();
        cartRepository.save(cart);

        return handlePayment(saved);
    }

    // ⚡ BUY NOW FLOW
    @Override
    @Transactional
    public Object checkoutBuyNow(OrderRequest request) {

        Order order = buildBaseOrder(request);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();

        for (OrderItemRequest item : request.getItems()) {

            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));

            int updated = variantRepository.reserveStock(
                    variant.getId(),
                    item.getQuantity()
            );

            if (updated == 0) {
                throw new RuntimeException("Sản phẩm hết hàng");
            }

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


    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }


        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.CONFIRMED);

        orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        for (OrderDetail item : order.getOrderDetails()) {
            variantRepository.releaseStock(
                    item.getVariant().getId(),
                    item.getQuantity()
            );
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
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
        res.setOrderDate(order.getOrderDate());
        res.setPaymentMethod(order.getPaymentMethod().name());
        res.setPaymentStatus(order.getPaymentStatus().name());
        return res;
    }

    private OrderDetailResponse mapToDetailResponse(Order order) {
        OrderDetailResponse res = new OrderDetailResponse();
        res.setId(order.getId());
        res.setAmount(order.getAmount());
        res.setOrderStatus(order.getOrderStatus().name());
        res.setShippingAddress(order.getShippingAddress());
        res.setPhoneNumber(order.getPhoneNumber());
        res.setOrderDate(order.getOrderDate());
        res.setPaymentMethod(order.getPaymentMethod().name());
        res.setPaymentStatus(order.getPaymentStatus().name());
        res.setItems(
                order.getOrderDetails().stream().map(item -> {
                    OrderItemResponse itemRes = new OrderItemResponse();

                    itemRes.setVariantId(item.getVariant().getId());
                    itemRes.setProductName(item.getVariant().getProduct().getName());
                    itemRes.setVariantName(item.getVariant().getName());

                    itemRes.setPrice(item.getPrice());
                    itemRes.setQuantity(item.getQuantity());

                    return itemRes;
                }).toList()
        );
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