package com.techgadget.server.service.impl;

import com.techgadget.server.exception.DuplicateResourceException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.exception.BadRequestException;
import com.techgadget.server.model.dto.coupon.CouponRequest;
import com.techgadget.server.model.dto.coupon.CouponResponse;
import com.techgadget.server.model.dto.coupon.CouponValidationResponse;
import com.techgadget.server.model.entity.Coupon;
import com.techgadget.server.model.entity.CouponUsage;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.repository.CouponRepository;
import com.techgadget.server.repository.CouponUsageRepository;
import com.techgadget.server.repository.UserRepository;
import com.techgadget.server.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;

    @Override
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<CouponResponse> searchCouponsByCode(String code) {
        return couponRepository.findByCodeContainingIgnoreCase(code)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CouponResponse> getActiveCoupons() {
        return couponRepository.findActiveCoupons(LocalDateTime.now())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CouponValidationResponse> getCheckoutCoupons(BigDecimal orderAmount) {
        BigDecimal safeOrderAmount = orderAmount != null ? orderAmount : BigDecimal.ZERO;
        User currentUser = getCurrentUserOrNull();
        return couponRepository.findAll()
                .stream()
                .map(coupon -> {
                    ValidationResult result = evaluateCoupon(coupon, safeOrderAmount, currentUser);
                    BigDecimal discount = result.valid() ? result.discount() : BigDecimal.ZERO;
                    BigDecimal finalAmount = result.valid() ? result.finalAmount() : safeOrderAmount;

                    return CouponValidationResponse.builder()
                            .code(coupon.getCode())
                            .type(coupon.getType())
                            .value(coupon.getValue())
                            .minOrderAmount(coupon.getMinOrderAmount())
                            .maxDiscountAmount(coupon.getMaxDiscountAmount())
                            .startAt(coupon.getStartAt())
                            .endAt(coupon.getEndAt())
                            .usageLimit(coupon.getUsageLimit())
                            .usedCount(coupon.getUsedCount())
                            .isActive(coupon.getIsActive())
                            .usageLimitPerUser(coupon.getUsageLimitPerUser())
                            .userUsedCount(result.userUsedCount())
                            .userRemainingUses(result.userRemainingUses())
                            .orderAmount(safeOrderAmount)
                            .discountAmount(discount)
                            .finalAmount(finalAmount)
                            .valid(result.valid())
                            .invalidReason(result.reason())
                            .build();
                })
                .toList();
    }

    @Override
    public CouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Coupon not found with id: " + id));
        return mapToResponse(coupon);
    }

    @Override
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Coupon", "code", request.getCode());
        }

        Coupon coupon = new Coupon();
        applyRequest(coupon, request);
        Coupon saved = couponRepository.save(coupon);
        return mapToResponse(saved);
    }

    @Override
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Coupon not found with id: " + id));

        String newCode = request.getCode();
        if (newCode != null && !newCode.equalsIgnoreCase(coupon.getCode())
                && couponRepository.existsByCode(newCode)) {
            throw new DuplicateResourceException("Coupon", "code", newCode);
        }

        applyRequest(coupon, request);
        Coupon updated = couponRepository.save(coupon);
        return mapToResponse(updated);
    }

    @Override
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Coupon not found with id: " + id));
        couponRepository.delete(coupon);
    }

    @Override
    public CouponValidationResponse validateCoupon(String code, BigDecimal orderAmount) {
        if (code == null || code.trim().isEmpty()) {
            throw new BadRequestException("Coupon code is required.");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new NotFoundException("Coupon not found with code: " + code));

        BigDecimal safeOrderAmount = orderAmount != null ? orderAmount : BigDecimal.ZERO;
        ValidationResult result = evaluateCoupon(coupon, safeOrderAmount, getCurrentUserOrNull());
        if (!result.valid()) {
            throw new BadRequestException(result.reason());
        }

        return CouponValidationResponse.builder()
                .code(coupon.getCode())
                .type(coupon.getType())
                .value(coupon.getValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .startAt(coupon.getStartAt())
                .endAt(coupon.getEndAt())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .isActive(coupon.getIsActive())
                .usageLimitPerUser(coupon.getUsageLimitPerUser())
                .userUsedCount(result.userUsedCount())
                .userRemainingUses(result.userRemainingUses())
                .orderAmount(safeOrderAmount)
                .discountAmount(result.discount())
                .finalAmount(result.finalAmount())
                .valid(true)
                .invalidReason(null)
                .build();
    }

    @Override
    public void recordCouponUsage(String code, Long userId) {
        if (code == null || code.trim().isEmpty()) {
            return;
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
        if (coupon == null) {
            return;
        }

        couponRepository.incrementUsedCount(coupon.getId());

        if (userId == null) {
            return;
        }

        CouponUsage usage = couponUsageRepository.findByUserIdAndCouponId(userId, coupon.getId())
                .orElse(null);
        if (usage == null) {
            usage = new CouponUsage();
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return;
            }
            usage.setUser(user);
            usage.setCoupon(coupon);
            usage.setUsedCount(1);
            couponUsageRepository.save(usage);
        } else {
            couponUsageRepository.incrementUsedCount(userId, coupon.getId());
        }
    }

    private void applyRequest(Coupon coupon, CouponRequest request) {
        coupon.setCode(request.getCode());
        coupon.setType(request.getType());
        coupon.setValue(request.getValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setStartAt(request.getStartAt());
        coupon.setEndAt(request.getEndAt());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setUsedCount(request.getUsedCount());
        coupon.setUsageLimitPerUser(request.getUsageLimitPerUser());
        coupon.setIsActive(request.getIsActive());
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        if (orderAmount == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (coupon.getType() == null || coupon.getValue() == null) {
            return BigDecimal.ZERO;
        }

        switch (coupon.getType()) {
            case PERCENT -> {
                discount = orderAmount.multiply(coupon.getValue())
                        .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            }
            case FIXED -> discount = coupon.getValue();
            default -> discount = BigDecimal.ZERO;
        }

        if (coupon.getMaxDiscountAmount() != null
                && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            discount = discount.min(coupon.getMaxDiscountAmount());
        }

        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO;
        }

        return discount;
    }

    private ValidationResult evaluateCoupon(Coupon coupon, BigDecimal orderAmount, User user) {
        if (coupon == null) {
            return new ValidationResult(false, "Coupon not found.", BigDecimal.ZERO, orderAmount, null, null);
        }

        if (coupon.getIsActive() != null && !coupon.getIsActive()) {
            return new ValidationResult(false, "Coupon is inactive.", BigDecimal.ZERO, orderAmount, null, null);
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartAt() != null && now.isBefore(coupon.getStartAt())) {
            return new ValidationResult(false, "Coupon is not active yet.", BigDecimal.ZERO, orderAmount, null, null);
        }

        if (coupon.getEndAt() != null && now.isAfter(coupon.getEndAt())) {
            return new ValidationResult(false, "Coupon has expired.", BigDecimal.ZERO, orderAmount, null, null);
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return new ValidationResult(false, "Order amount does not meet the minimum requirement.", BigDecimal.ZERO, orderAmount, null, null);
        }

        int usedCount = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0 && usedCount >= coupon.getUsageLimit()) {
            return new ValidationResult(false, "Coupon usage limit has been reached.", BigDecimal.ZERO, orderAmount, null, null);
        }

        Integer perUserLimit = coupon.getUsageLimitPerUser();
        Integer userUsedCount = null;
        Integer userRemainingUses = null;
        if (perUserLimit != null && perUserLimit > 0) {
            if (user == null) {
                return new ValidationResult(false, "Login required to use this coupon.", BigDecimal.ZERO, orderAmount, null, null);
            }
            CouponUsage usage = couponUsageRepository.findByUserIdAndCouponId(user.getId(), coupon.getId())
                    .orElse(null);
            userUsedCount = usage != null && usage.getUsedCount() != null ? usage.getUsedCount() : 0;
            userRemainingUses = Math.max(perUserLimit - userUsedCount, 0);
            if (userRemainingUses <= 0) {
                return new ValidationResult(false, "Coupon usage limit reached for this account.", BigDecimal.ZERO, orderAmount, userUsedCount, userRemainingUses);
            }
        }

        BigDecimal discount = calculateDiscount(coupon, orderAmount);
        BigDecimal finalAmount = orderAmount.subtract(discount);
        return new ValidationResult(true, null, discount, finalAmount, userUsedCount, userRemainingUses);
    }

    private record ValidationResult(
            boolean valid,
            String reason,
            BigDecimal discount,
            BigDecimal finalAmount,
            Integer userUsedCount,
            Integer userRemainingUses
    ) {
    }

    private CouponResponse mapToResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .value(coupon.getValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .startAt(coupon.getStartAt())
                .endAt(coupon.getEndAt())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .usageLimitPerUser(coupon.getUsageLimitPerUser())
                .isActive(coupon.getIsActive())
                .build();
    }

    private User getCurrentUserOrNull() {
        try {
            String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getName();
            return userRepository.findByEmail(email).orElse(null);
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
