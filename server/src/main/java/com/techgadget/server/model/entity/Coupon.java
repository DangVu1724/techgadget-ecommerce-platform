package com.techgadget.server.model.entity;

import com.techgadget.server.model.enums.CouponType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    @Column(nullable = false)
    private BigDecimal value;

    private BigDecimal minOrderAmount;

    private BigDecimal maxDiscountAmount;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private Integer usageLimit;

    private Integer usedCount;

    private Boolean isActive;
}
