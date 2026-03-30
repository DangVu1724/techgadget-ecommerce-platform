package com.techgadget.server.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "related_products",
        indexes = {
                @Index(name = "idx_related_product_product", columnList = "product_id"),
                @Index(name = "idx_related_product_related", columnList = "related_product_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_related_product_pair", columnNames = {"product_id", "related_product_id"})
        }
)
@Getter
@Setter
public class RelatedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "related_product_id", nullable = false)
    private Product relatedProduct;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
