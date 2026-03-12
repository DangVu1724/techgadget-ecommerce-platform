package com.techgadget.server.repository;

import com.techgadget.server.model.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findByUserId(Long userId);

    @Query("""
SELECT c FROM Cart c
LEFT JOIN FETCH c.items i
LEFT JOIN FETCH i.variant v
LEFT JOIN FETCH v.product
WHERE c.user.id = :userId
""")
    Optional<Cart> findCartWithItems(Long userId);
}
