package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.coupon.CouponResponse;
import com.techgadget.server.model.dto.coupon.CouponValidationRequest;
import com.techgadget.server.model.dto.coupon.CouponValidationResponse;
import com.techgadget.server.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getActiveCoupons() {
        return ResponseEntity.ok(
                ApiResponse.success("Active coupons retrieved successfully.", couponService.getActiveCoupons())
        );
    }

    @GetMapping("/checkout")
    public ResponseEntity<ApiResponse<List<CouponValidationResponse>>> getCheckoutCoupons(
            @RequestParam(required = false) java.math.BigDecimal orderAmount
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Checkout coupons retrieved successfully.",
                        couponService.getCheckoutCoupons(orderAmount)
                )
        );
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody CouponValidationRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Coupon validated successfully.",
                        couponService.validateCoupon(request.getCode(), request.getOrderAmount())
                )
        );
    }
}
