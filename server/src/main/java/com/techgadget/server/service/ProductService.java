package com.techgadget.server.service;

import com.techgadget.server.model.dto.ProductSummaryResponse;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductSummaryResponse> getAllProducts() {
        List<Product> products = productRepository.findAllWithDetails();

        return products.stream().map(this::convertToSummaryResponse).toList();
    }

    private ProductSummaryResponse convertToSummaryResponse(Product product) {
        BigDecimal minPrice = getMinPrice(product);
        Integer totalStock = getTotalStock(product);

        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .image(product.getImage())
                .minPrice(minPrice)
                .totalStock(totalStock)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getBrandName() : null)
                .build();
    }

    private BigDecimal getMinPrice(Product product) {
        if (product.getVariants() == null || product.getVariants().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return product.getVariants().stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    private Integer getTotalStock(Product product) {
        if (product.getVariants() == null) {
            return 0;
        }

        return product.getVariants()
                .stream()
                .map(ProductVariant::getStock)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
    }
}
