package com.techgadget.server.repository;

import com.techgadget.server.model.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    Optional<CouponUsage> findByUserIdAndCouponId(Long userId, Long couponId);

    @Modifying
    @Query("""
        update CouponUsage cu
        set cu.usedCount = coalesce(cu.usedCount, 0) + 1
        where cu.user.id = :userId and cu.coupon.id = :couponId
        """)
    int incrementUsedCount(@Param("userId") Long userId, @Param("couponId") Long couponId);
}
