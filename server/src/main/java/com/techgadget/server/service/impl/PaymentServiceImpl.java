package com.techgadget.server.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techgadget.server.config.PayOSConfig;
import com.techgadget.server.exception.BadRequestException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.order.PendingOrderPayload;
import com.techgadget.server.model.dto.order.PaymentResponse;
import com.techgadget.server.model.entity.Order;
import com.techgadget.server.model.entity.OrderDetail;
import com.techgadget.server.model.entity.PendingPayment;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.model.enums.CheckoutType;
import com.techgadget.server.model.enums.OrderStatus;
import com.techgadget.server.model.enums.PendingPaymentStatus;
import com.techgadget.server.model.enums.PaymentMethod;
import com.techgadget.server.model.enums.PaymentStatus;
import com.techgadget.server.repository.CartRepository;
import com.techgadget.server.repository.CouponRepository;
import com.techgadget.server.repository.OrderDetailRepository;
import com.techgadget.server.repository.OrderRepository;
import com.techgadget.server.repository.PendingPaymentRepository;
import com.techgadget.server.repository.UserRepository;
import com.techgadget.server.repository.VariantRepository;
import com.techgadget.server.service.PaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PendingPaymentRepository pendingPaymentRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final VariantRepository variantRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CouponRepository couponRepository;
    private final ObjectMapper objectMapper;
    private final PayOS payOS;
    private final PayOSConfig payOSConfig;

    @Override
    @Transactional
    public PaymentResponse createQrPayment(PendingOrderPayload payload) {
        PendingPayment pendingPayment = new PendingPayment();
        pendingPayment.setOrderCode(generateOrderCode());
        pendingPayment.setTransactionId(UUID.randomUUID().toString());
        pendingPayment.setUserId(payload.getUserId());
        pendingPayment.setStatus(PendingPaymentStatus.PENDING);
        pendingPayment.setCreatedAt(LocalDateTime.now());
        pendingPayment.setUpdatedAt(LocalDateTime.now());
        pendingPayment.setPayloadJson(writePayload(payload));
        pendingPaymentRepository.save(pendingPayment);

        try {
            CreatePaymentLinkResponse payOSResponse = payOS.paymentRequests().create(
                    CreatePaymentLinkRequest.builder()
                            .orderCode(pendingPayment.getOrderCode())
                            .amount(toPayOSAmount(payload.getAmount()))
                            .description(buildPayOSDescription(pendingPayment.getOrderCode()))
                            .cancelUrl(payOSConfig.getCancelUrl())
                            .returnUrl(payOSConfig.getReturnUrl())
                            .buyerEmail(payload.getOrderEmail())
                            .buyerPhone(payload.getPhoneNumber())
                            .buyerAddress(payload.getShippingAddress())
                            .items(buildPayOSItems(payload.getItems()))
                            .expiredAt(LocalDateTime.now().plusMinutes(15).atZone(java.time.ZoneId.systemDefault()).toEpochSecond())
                            .build()
            );

            pendingPayment.setPaymentLinkId(payOSResponse.getPaymentLinkId());
            pendingPayment.setUpdatedAt(LocalDateTime.now());
            pendingPaymentRepository.save(pendingPayment);

            return buildPaymentResponse(pendingPayment, payOSResponse.getStatus(), payOSResponse.getCheckoutUrl());
        } catch (RuntimeException ex) {
            failPendingPayment(pendingPayment, PendingPaymentStatus.FAILED);
            throw ex;
        }
    }

    @Override
    @Transactional
    public PaymentResponse syncQrPayment(String transactionId) {
        PendingPayment pendingPayment = findPendingPayment(transactionId);

        if (pendingPayment.getStatus() == PendingPaymentStatus.COMPLETED) {
            return buildCompletedPaymentResponse(pendingPayment);
        }

        PaymentLink paymentLink = payOS.paymentRequests().get(pendingPayment.getOrderCode());
        PendingPaymentStatus nextStatus = mapPendingStatus(paymentLink.getStatus());

        if (nextStatus == PendingPaymentStatus.PAID) {
            Order order = finalizePendingPayment(pendingPayment);
            PaymentResponse response = buildPaymentResponse(pendingPayment, paymentLink.getStatus());
            response.setOrderId(order.getId());
            response.setPaymentStatus(PaymentStatus.PAID.name());
            return response;
        }

        if (nextStatus == PendingPaymentStatus.CANCELLED
                || nextStatus == PendingPaymentStatus.EXPIRED
                || nextStatus == PendingPaymentStatus.FAILED) {
            failPendingPayment(pendingPayment, nextStatus);
        } else {
            pendingPayment.setStatus(nextStatus);
            pendingPayment.setUpdatedAt(LocalDateTime.now());
            pendingPaymentRepository.save(pendingPayment);
        }

        return buildPaymentResponse(pendingPayment, paymentLink.getStatus());
    }

    private Order finalizePendingPayment(PendingPayment pendingPayment) {
        if (pendingPayment.getCreatedOrderId() != null) {
            Order existingOrder = orderRepository.findById(pendingPayment.getCreatedOrderId())
                    .orElseThrow(() -> new NotFoundException("Order not found with id: " + pendingPayment.getCreatedOrderId()));
            pendingPayment.setStatus(PendingPaymentStatus.COMPLETED);
            pendingPayment.setUpdatedAt(LocalDateTime.now());
            pendingPaymentRepository.save(pendingPayment);
            return existingOrder;
        }

        PendingOrderPayload payload = readPayload(pendingPayment.getPayloadJson());
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(payload.getShippingAddress());
        order.setPhoneNumber(payload.getPhoneNumber());
        order.setOrderEmail(payload.getOrderEmail());
        order.setOrderStatus(OrderStatus.CONFIRMED);
        order.setOrderCode(pendingPayment.getOrderCode());
        order.setPaymentMethod(PaymentMethod.QR);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setTransactionId(pendingPayment.getTransactionId());
        order.setAmount(payload.getAmount());
        order.setCouponCode(payload.getCouponCode());
        order.setDiscountAmount(payload.getDiscountAmount());

        if (payload.getUserId() != null) {
            User user = userRepository.findById(payload.getUserId())
                    .orElseThrow(() -> new NotFoundException("User not found with id: " + payload.getUserId()));
            order.setUser(user);
        }

        List<OrderDetail> details = new ArrayList<>();
        for (PendingOrderPayload.PendingOrderItemPayload item : payload.getItems()) {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new NotFoundException("Variant not found with id: " + item.getVariantId()));
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setVariant(variant);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(item.getPrice());
            details.add(detail);
        }

        order.setOrderDetails(details);
        Order savedOrder = orderRepository.save(order);
        orderDetailRepository.saveAll(details);

        incrementCouponUsage(payload.getCouponCode());

        if (payload.getCheckoutType() == CheckoutType.CART && payload.getUserId() != null) {
            clearCart(payload.getUserId());
        }

        pendingPayment.setStatus(PendingPaymentStatus.COMPLETED);
        pendingPayment.setCreatedOrderId(savedOrder.getId());
        pendingPayment.setUpdatedAt(LocalDateTime.now());
        pendingPaymentRepository.save(pendingPayment);
        return savedOrder;
    }

    private void clearCart(Long userId) {
        cartRepository.findCartWithItems(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    private void incrementCouponUsage(String couponCode) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return;
        }

        couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .ifPresent(coupon -> couponRepository.incrementUsedCount(coupon.getId()));
    }

    private void failPendingPayment(PendingPayment pendingPayment, PendingPaymentStatus status) {
        if (pendingPayment.getStatus() == PendingPaymentStatus.CANCELLED
                || pendingPayment.getStatus() == PendingPaymentStatus.EXPIRED
                || pendingPayment.getStatus() == PendingPaymentStatus.FAILED
                || pendingPayment.getStatus() == PendingPaymentStatus.COMPLETED) {
            return;
        }

        PendingOrderPayload payload = readPayload(pendingPayment.getPayloadJson());
        for (PendingOrderPayload.PendingOrderItemPayload item : payload.getItems()) {
            variantRepository.releaseStock(item.getVariantId(), item.getQuantity());
        }

        pendingPayment.setStatus(status);
        pendingPayment.setUpdatedAt(LocalDateTime.now());
        pendingPaymentRepository.save(pendingPayment);
    }

    private PendingPayment findPendingPayment(String transactionId) {
        PendingPayment pendingPayment = pendingPaymentRepository.findByTransactionId(transactionId)
                .orElseGet(() -> {
                    try {
                        return pendingPaymentRepository.findByOrderCode(Long.parseLong(transactionId)).orElse(null);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                });

        if (pendingPayment == null) {
            throw new NotFoundException("Pending payment not found with transactionId: " + transactionId);
        }

        return pendingPayment;
    }

    private List<PaymentLinkItem> buildPayOSItems(List<PendingOrderPayload.PendingOrderItemPayload> items) {
        return items.stream().map(item -> PaymentLinkItem.builder()
                .name(buildPayOSItemName(item))
                .quantity(item.getQuantity())
                .price(toPayOSAmount(item.getPrice()))
                .build()).toList();
    }

    private String buildPayOSItemName(PendingOrderPayload.PendingOrderItemPayload item) {
        String rawName = item.getProductName() + " " + item.getVariantName();
        return rawName.length() > 25 ? rawName.substring(0, 25) : rawName;
    }

    private String buildPayOSDescription(Long orderCode) {
        return "TGDH" + orderCode;
    }

    private Long toPayOSAmount(BigDecimal amount) {
        return amount.setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private PendingPaymentStatus mapPendingStatus(PaymentLinkStatus status) {
        return switch (status) {
            case PAID -> PendingPaymentStatus.PAID;
            case CANCELLED -> PendingPaymentStatus.CANCELLED;
            case EXPIRED -> PendingPaymentStatus.EXPIRED;
            case FAILED -> PendingPaymentStatus.FAILED;
            default -> PendingPaymentStatus.PENDING;
        };
    }

    private PaymentResponse buildPaymentResponse(PendingPayment pendingPayment, PaymentLinkStatus status) {
        return buildPaymentResponse(pendingPayment, status, null);
    }

    private PaymentResponse buildPaymentResponse(PendingPayment pendingPayment, PaymentLinkStatus status, String checkoutUrl) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(pendingPayment.getTransactionId());
        response.setPaymentUrl(checkoutUrl);
        response.setPaymentStatus(status.name());
        response.setOrderId(pendingPayment.getCreatedOrderId());
        return response;
    }

    private PaymentResponse buildCompletedPaymentResponse(PendingPayment pendingPayment) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(pendingPayment.getTransactionId());
        response.setPaymentStatus(PaymentStatus.PAID.name());
        response.setOrderId(pendingPayment.getCreatedOrderId());
        return response;
    }

    private String writePayload(PendingOrderPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("Unable to create payment payload.");
        }
    }

    private PendingOrderPayload readPayload(String payloadJson) {
        try {
            return objectMapper.readValue(payloadJson, PendingOrderPayload.class);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("Unable to read payment payload.");
        }
    }

    private Long generateOrderCode() {
        return System.currentTimeMillis() + (long) (Math.random() * 1000);
    }
}
