package com.techgadget.server.repository;

import com.techgadget.server.model.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem,Long> {
    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);

}
