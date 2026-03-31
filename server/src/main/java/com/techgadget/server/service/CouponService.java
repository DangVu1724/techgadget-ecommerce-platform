package com.techgadget.server.service;

import com.techgadget.server.model.dto.coupon.CouponRequest;
import com.techgadget.server.model.dto.coupon.CouponResponse;
import com.techgadget.server.model.dto.coupon.CouponValidationResponse;

import java.util.List;

public interface CouponService {
    List<CouponResponse> getAllCoupons();

    List<CouponResponse> searchCouponsByCode(String code);

    List<CouponResponse> getActiveCoupons();

    CouponResponse getCouponById(Long id);

    CouponResponse createCoupon(CouponRequest request);

    CouponResponse updateCoupon(Long id, CouponRequest request);

    void deleteCoupon(Long id);

    CouponValidationResponse validateCoupon(String code, java.math.BigDecimal orderAmount);

    java.util.List<CouponValidationResponse> getCheckoutCoupons(java.math.BigDecimal orderAmount);

    void recordCouponUsage(String code, Long userId);
}
