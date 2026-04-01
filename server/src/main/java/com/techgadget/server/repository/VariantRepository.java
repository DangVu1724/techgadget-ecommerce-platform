package com.techgadget.server.repository;

import com.techgadget.server.model.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VariantRepository extends JpaRepository<ProductVariant,Long> {
    @Query("""
    SELECT DISTINCT v FROM ProductVariant v
    LEFT JOIN FETCH v.attributeValues av
    LEFT JOIN FETCH av.attribute
    WHERE v.id = :id
""")
    Optional<ProductVariant> findDetailById(Long id);

    @Modifying
    @Query("""
        UPDATE ProductVariant v 
        SET v.reservedStock = v.reservedStock + :qty 
        WHERE v.id = :id 
        AND (v.stock - v.reservedStock) >= :qty
    """)
    int reserveStock(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("""
        UPDATE ProductVariant v 
        SET v.reservedStock = v.reservedStock - :qty 
        WHERE v.id = :id 
        AND v.reservedStock >= :qty 
    """) // FIX: Chặn không cho trừ quá số lượng đang giữ
    int releaseStock(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("""
        UPDATE ProductVariant v 
        SET v.stock = v.stock - :qty, 
            v.reservedStock = v.reservedStock - :qty 
        WHERE v.id = :id 
        AND v.stock >= :qty 
        AND v.reservedStock >= :qty
    """) // FIX: Đảm bảo cả kho và hàng giữ chỗ đều đủ để trừ
    int confirmStock(@Param("id") Long id, @Param("qty") int qty);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE ProductVariant v SET v.soldCount = v.soldCount + :qty WHERE v.id = :id")
    void incrementSoldCount(@Param("id") Long id, @Param("qty") int qty);
}
