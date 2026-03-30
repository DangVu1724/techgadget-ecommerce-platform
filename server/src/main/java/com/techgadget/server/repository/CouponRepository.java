package com.techgadget.server.repository;

import com.techgadget.server.model.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);

    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCode(String code);

    List<Coupon> findByCodeContainingIgnoreCase(String code);

    @Query("""
        select c from Coupon c
        where (c.isActive = true or c.isActive is null)
          and (c.startAt is null or c.startAt <= :now)
          and (c.endAt is null or c.endAt >= :now)
          and (c.usageLimit is null or c.usageLimit = 0 or coalesce(c.usedCount, 0) < c.usageLimit)
        order by c.startAt desc nulls last, c.id desc
        """)
    List<Coupon> findActiveCoupons(@Param("now") LocalDateTime now);

    @Modifying
    @Query("update Coupon c set c.usedCount = coalesce(c.usedCount, 0) + 1 where c.id = :id")
    int incrementUsedCount(@Param("id") Long id);
}
