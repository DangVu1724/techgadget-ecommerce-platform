package com.techgadget.server.model.dto.coupon;

import com.techgadget.server.model.enums.CouponType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {

    @NotBlank(message = "Coupon code is required.")
    private String code;

    @NotNull(message = "Coupon type is required.")
    private CouponType type;

    @NotNull(message = "Coupon value is required.")
    private BigDecimal value;

    private BigDecimal minOrderAmount;

    private BigDecimal maxDiscountAmount;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private Integer usageLimit;

    private Integer usedCount;

    private Integer usageLimitPerUser;

    private Boolean isActive;
}
