package com.techgadget.server.service.impl;

import com.techgadget.server.exception.DuplicateResourceException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.exception.BadRequestException;
import com.techgadget.server.model.dto.coupon.CouponRequest;
import com.techgadget.server.model.dto.coupon.CouponResponse;
import com.techgadget.server.model.dto.coupon.CouponValidationResponse;
import com.techgadget.server.model.entity.Coupon;
import com.techgadget.server.repository.CouponRepository;
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

        if (coupon.getIsActive() != null && !coupon.getIsActive()) {
            throw new BadRequestException("Coupon is inactive.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartAt() != null && now.isBefore(coupon.getStartAt())) {
            throw new BadRequestException("Coupon is not active yet.");
        }

        if (coupon.getEndAt() != null && now.isAfter(coupon.getEndAt())) {
            throw new BadRequestException("Coupon has expired.");
        }

        BigDecimal safeOrderAmount = orderAmount != null ? orderAmount : BigDecimal.ZERO;
        if (coupon.getMinOrderAmount() != null && safeOrderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Order amount does not meet the minimum requirement.");
        }

        int usedCount = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0 && usedCount >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached.");
        }

        BigDecimal discount = calculateDiscount(coupon, safeOrderAmount);
        BigDecimal finalAmount = safeOrderAmount.subtract(discount);

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
                .orderAmount(safeOrderAmount)
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .build();
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
                .isActive(coupon.getIsActive())
                .build();
    }
}
