package com.techgadget.server.controller.admin;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.coupon.CouponRequest;
import com.techgadget.server.model.dto.coupon.CouponResponse;
import com.techgadget.server.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("adminCouponController")
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        return ResponseEntity.ok(
                ApiResponse.success("Coupons retrieved successfully.", couponService.getAllCoupons())
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> searchCouponsByCode(
            @RequestParam("code") String code
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Coupons retrieved successfully.", couponService.searchCouponsByCode(code))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Coupon retrieved successfully.", couponService.getCouponById(id))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CouponRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Coupon created successfully.", couponService.createCoupon(request))
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Coupon updated successfully.", couponService.updateCoupon(id, request))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully.", null));
    }
}
