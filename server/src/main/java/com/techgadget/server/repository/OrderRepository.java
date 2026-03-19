package com.techgadget.server.repository;

import com.techgadget.server.model.entity.Order;
import com.techgadget.server.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findAll(Pageable pageable);

    Page<Order> findByOrderStatus(OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.orderDetails WHERE o.id = :id")
    Optional<Order> findById(Long id);
}
