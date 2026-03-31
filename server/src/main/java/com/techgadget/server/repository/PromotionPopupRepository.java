package com.techgadget.server.repository;

import com.techgadget.server.model.entity.PromotionPopup;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PromotionPopupRepository extends JpaRepository<PromotionPopup, Long> {

    @Query("""
SELECT p FROM PromotionPopup p
WHERE p.isActive = true
AND (p.startDate IS NULL OR p.startDate <= :now)
AND (p.endDate IS NULL OR p.endDate >= :now)
ORDER BY p.startDate DESC, p.id DESC
""")
    List<PromotionPopup> findActivePopups(@Param("now") LocalDateTime now, Pageable pageable);
}
