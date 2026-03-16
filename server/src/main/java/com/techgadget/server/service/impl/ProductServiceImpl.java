package com.techgadget.server.service.impl;

import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.dto.product.ProductCreateRequest;
import com.techgadget.server.model.dto.product.ProductResponse;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.dto.product.ProductUpdateRequest;
import com.techgadget.server.model.dto.variant.VariantAttributeResponse;
import com.techgadget.server.model.dto.variant.VariantResponse;
import com.techgadget.server.model.entity.Brand;
import com.techgadget.server.model.entity.Category;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.repository.BrandRepository;
import com.techgadget.server.repository.CategoryRepository;
import com.techgadget.server.repository.ProductRepository;
import com.techgadget.server.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Override
    public Page<ProductSummaryResponse> getProducts(Pageable pageable) {
        return productRepository.findProductSummary(pageable);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return productRepository.findProductDetail(id).map(this::mapToProductResponse).orElseThrow(() -> new RuntimeException("Product not found"));

    }

    @Override
    public Page<ProductSummaryResponse> filterProducts(Pageable pageable, Long brandId, Long categoryId) {
        return productRepository.filterProducts(pageable,brandId,categoryId);
    }


    @Override
    public ProductResponse createProduct(ProductCreateRequest request) {

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (productRepository.existsByName(request.getName())) {
            throw new RuntimeException("Product name already exists");
        }

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setDescription(
                request.getDescription() != null ? request.getDescription().trim() : null
        );
        product.setBrand(brand);
        product.setCategory(category);

        Product saved = productRepository.save(product);

        return mapToProductResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBrand(brand);
        product.setCategory(category);

        Product updated = productRepository.save(product);

        return mapToProductResponse(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productRepository.delete(product);
    }


    private ProductResponse mapToProductResponse(Product product) {

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .image(product.getImage())
                .createdAt(product.getCreatedAt())

                .category(
                        CategoryResponse.builder()
                                .id(product.getCategory().getId())
                                .name(product.getCategory().getName())
                                .build()
                )

                .brand(
                        BrandResponse.builder()
                                .brandId(product.getBrand().getBrandId())
                                .brandName(product.getBrand().getBrandName())
                                .build()
                )

                .variants(
                        product.getVariants().stream()
                                .map(v -> VariantResponse.builder()
                                        .id(v.getId())
                                        .name(v.getName())
                                        .sku(v.getSku())
                                        .price(v.getPrice())
                                        .stock(v.getStock())
                                        .description(v.getDescription())

                                        .attributes(
                                                v.getAttributeValues().stream()
                                                        .map(av -> VariantAttributeResponse.builder()
                                                                .attributeId(av.getAttribute().getAttributeId())
                                                                .attributeName(av.getAttribute().getAttributeName())
                                                                .value(av.getValue())
                                                                .build())
                                                        .toList()
                                        )

                                        .build())
                                .toList()
                )

                .minPrice(
                        product.getVariants().stream()
                                .map(ProductVariant::getPrice)
                                .min(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO)
                )

                .maxPrice(
                        product.getVariants().stream()
                                .map(ProductVariant::getPrice)
                                .max(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO)
                )

                .totalStock(
                        product.getVariants().stream()
                                .mapToInt(ProductVariant::getStock)
                                .sum()
                )

                .build();
    }
}
