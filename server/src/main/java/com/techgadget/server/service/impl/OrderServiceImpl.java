package com.techgadget.server.service.impl;

import com.techgadget.server.exception.BadRequestException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.order.OrderDetailResponse;
import com.techgadget.server.model.dto.order.OrderItemRequest;
import com.techgadget.server.model.dto.order.OrderItemResponse;
import com.techgadget.server.model.dto.order.OrderRequest;
import com.techgadget.server.model.dto.order.OrderResponse;
import com.techgadget.server.model.dto.order.PendingOrderPayload;
import com.techgadget.server.model.entity.Cart;
import com.techgadget.server.model.entity.CartItem;
import com.techgadget.server.model.entity.Order;
import com.techgadget.server.model.entity.OrderDetail;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.model.enums.CheckoutType;
import com.techgadget.server.model.enums.OrderStatus;
import com.techgadget.server.model.enums.PaymentMethod;
import com.techgadget.server.model.enums.PaymentStatus;
import com.techgadget.server.repository.CartRepository;
import com.techgadget.server.repository.OrderRepository;
import com.techgadget.server.repository.UserRepository;
import com.techgadget.server.repository.VariantRepository;
import com.techgadget.server.service.OrderService;
import com.techgadget.server.service.PaymentService;
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
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final VariantRepository variantRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<OrderResponse> getMyOrders(Pageable pageable) {
        User user = getCurrentUser();
        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId(), pageable).map(this::mapToResponse);
    }

    @Override
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByOrderStatus(status, pageable).map(this::mapToResponse);
    }

    @Override
    public OrderDetailResponse getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));
        return mapToDetailResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        validateStatusTransition(order.getOrderStatus(), newStatus);

        if (newStatus == OrderStatus.CANCELLED
                && (order.getOrderStatus() == OrderStatus.PENDING || order.getOrderStatus() == OrderStatus.CONFIRMED)) {
            for (OrderDetail item : order.getOrderDetails()) {
                variantRepository.releaseStock(item.getVariant().getId(), item.getQuantity());
            }
        }

        if (newStatus == OrderStatus.PROCESSING) {
            for (OrderDetail item : order.getOrderDetails()) {
                variantRepository.confirmStock(item.getVariant().getId(), item.getQuantity());
            }
        }

        if (newStatus == OrderStatus.DELIVERED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        order.setOrderStatus(newStatus);
        orderRepository.save(order);
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public Object checkoutFromCart(OrderRequest request) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findCartWithItems(user.getId())
                .orElseThrow(() -> new NotFoundException("Cart not found for user id: " + user.getId()));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty.");
        }

        if (request.getPaymentMethod() == PaymentMethod.QR) {
            return paymentService.createQrPayment(buildCartPendingPayload(request, user, cart));
        }

        Order order = buildBaseOrder(request);
        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();

        for (CartItem item : cart.getItems()) {
            ProductVariant variant = item.getVariant();
            reserveStock(variant.getId(), item.getQuantity());

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setVariant(variant);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(variant.getPrice());

            total = total.add(variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            details.add(detail);
        }

        order.setOrderDetails(details);
        order.setAmount(total);
        order.setUser(user);

        Order saved = orderRepository.save(order);
        cart.getItems().clear();
        cartRepository.save(cart);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public Object checkoutBuyNow(OrderRequest request) {
        User user = getCurrentUser();

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order items are required.");
        }

        if (request.getPaymentMethod() == PaymentMethod.QR) {
            return paymentService.createQrPayment(buildBuyNowPendingPayload(request, user));
        }

        Order order = buildBaseOrder(request);
        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();

        for (OrderItemRequest item : request.getItems()) {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new NotFoundException("Variant not found with id: " + item.getVariantId()));

            reserveStock(variant.getId(), item.getQuantity());

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setVariant(variant);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(variant.getPrice());

            total = total.add(variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            details.add(detail);
        }

        order.setOrderDetails(details);
        order.setAmount(total);
        order.setUser(user);

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    private PendingOrderPayload buildCartPendingPayload(OrderRequest request, User user, Cart cart) {
        List<PendingOrderPayload.PendingOrderItemPayload> pendingItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            ProductVariant variant = item.getVariant();
            reserveStock(variant.getId(), item.getQuantity());
            total = total.add(variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            pendingItems.add(buildPendingItem(variant, item.getQuantity()));
        }

        return buildPendingPayload(request, user.getId(), CheckoutType.CART, total, pendingItems);
    }

    private PendingOrderPayload buildBuyNowPendingPayload(OrderRequest request, User user) {
        List<PendingOrderPayload.PendingOrderItemPayload> pendingItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest item : request.getItems()) {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new NotFoundException("Variant not found with id: " + item.getVariantId()));
            reserveStock(variant.getId(), item.getQuantity());
            total = total.add(variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            pendingItems.add(buildPendingItem(variant, item.getQuantity()));
        }

        return buildPendingPayload(request, user.getId(), CheckoutType.BUY_NOW, total, pendingItems);
    }

    private PendingOrderPayload buildPendingPayload(
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

    private PendingOrderPayload.PendingOrderItemPayload buildPendingItem(ProductVariant variant, int quantity) {
        PendingOrderPayload.PendingOrderItemPayload payload = new PendingOrderPayload.PendingOrderItemPayload();
        payload.setVariantId(variant.getId());
        payload.setProductName(variant.getProduct().getName());
        payload.setVariantName(variant.getName());
        payload.setPrice(variant.getPrice());
        payload.setQuantity(quantity);
        return payload;
    }

    private void validateStatusTransition(OrderStatus oldStatus, OrderStatus newStatus) {
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

    private void reserveStock(Long variantId, int quantity) {
        int updated = variantRepository.reserveStock(variantId, quantity);
        if (updated == 0) {
            throw new BadRequestException("Product is out of stock.");
        }
    }

    private Order buildBaseOrder(OrderRequest request) {
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setOrderCode(generateOrderCode());
        order.setShippingAddress(request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setOrderEmail(request.getOrderEmail());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);
        return order;
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderCode(order.getOrderCode());
        response.setAmount(order.getAmount());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setOrderDate(order.getOrderDate());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        return response;
    }

    private OrderDetailResponse mapToDetailResponse(Order order) {
        OrderDetailResponse response = new OrderDetailResponse();
        response.setId(order.getId());
        response.setOrderCode(order.getOrderCode());
        response.setAmount(order.getAmount());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setShippingAddress(order.getShippingAddress());
        response.setPhoneNumber(order.getPhoneNumber());
        response.setOrderDate(order.getOrderDate());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        response.setItems(order.getOrderDetails().stream().map(item -> {
            OrderItemResponse itemResponse = new OrderItemResponse();
            itemResponse.setVariantId(item.getVariant().getId());
            itemResponse.setProductName(item.getVariant().getProduct().getName());
            itemResponse.setVariantName(item.getVariant().getName());
            itemResponse.setPrice(item.getPrice());
            itemResponse.setQuantity(item.getQuantity());
            return itemResponse;
        }).toList());
        return response;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
    }

    private Long generateOrderCode() {
        return System.currentTimeMillis() + ThreadLocalRandom.current().nextLong(1000);
    }
}
