package com.techgadget.server.repository;

import com.techgadget.server.model.dto.product.TopProductResponse;
import com.techgadget.server.model.entity.OrderDetail;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    @Query("""
SELECT new com.techgadget.server.model.dto.product.TopProductResponse(
    p.id,
    p.name,
    p.image,

    MIN(v.price),
    MAX(v.price),

    COALESCE(SUM(od.quantity), 0),
    p.averageRating,
    p.totalReviews
)
FROM OrderDetail od
JOIN od.variant v
JOIN v.product p

WHERE od.order.orderStatus = com.techgadget.server.model.enums.OrderStatus.DELIVERED

GROUP BY p.id, p.name, p.image, p.averageRating, p.totalReviews
ORDER BY COALESCE(SUM(od.quantity), 0) DESC
""")
    List<TopProductResponse> findTopSellingProducts(Pageable pageable);
}
