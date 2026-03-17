package com.techgadget.server.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String name;

    @NotBlank(message = "SKU không được để trống")
    @Size(min = 6, max = 50, message = "SKU phải từ 6-50 ký tự")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "SKU chỉ được chứa chữ hoa, số, gạch ngang và gạch dưới")
    @Column(nullable = false, length = 50, unique = true,columnDefinition = "TEXT")
    private String sku;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL,orphanRemoval = true)
    private Set<VariantAttributeValue> attributeValues = new HashSet<>();

    @OneToMany(mappedBy = "variant")
    private List<OrderDetail> orderDetails;
}
