package com.techgadget.server.service.impl;

import com.techgadget.server.exception.ConflictException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.dto.product.ProductCreateRequest;
import com.techgadget.server.model.dto.product.ProductResponse;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.dto.product.ProductUpdateRequest;
import com.techgadget.server.model.dto.product.TopProductResponse;
import com.techgadget.server.model.dto.variant.VariantAttributeResponse;
import com.techgadget.server.model.dto.variant.VariantResponse;
import com.techgadget.server.model.entity.Brand;
import com.techgadget.server.model.entity.Category;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.repository.BrandRepository;
import com.techgadget.server.repository.CategoryRepository;
import com.techgadget.server.repository.OrderDetailRepository;
import com.techgadget.server.repository.ProductRepository;
import com.techgadget.server.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public Page<ProductSummaryResponse> getProducts(Pageable pageable) {
        return productRepository.findProductSummary(pageable);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return productRepository.findProductDetail(id)
                .map(this::mapToProductResponse)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
    }

    @Override
    public Page<ProductSummaryResponse> filterProducts(
            Pageable pageable,
            String keyword,
            Long brandId,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String ram,
            String storage
    ) {
        // Apply smart search corrections
        String smartKeyword = correctSearchKeyword(keyword);
        
        // Try exact match first
        Page<ProductSummaryResponse> results = productRepository.filterProducts(
            pageable, smartKeyword, brandId, categoryId, minPrice, maxPrice, ram, storage);
        
        // If no results and keyword has typos, try fuzzy variations
        if (results.isEmpty() && keyword != null && keyword.length() >= 3) {
            List<String> variations = generateFuzzyVariations(smartKeyword);
            
            for (String variation : variations) {
                if (!variation.equals(smartKeyword)) {
                    Page<ProductSummaryResponse> fuzzyResults = productRepository.filterProducts(
                        pageable, variation, brandId, categoryId, minPrice, maxPrice, ram, storage);
                    
                    if (!fuzzyResults.isEmpty()) {
                        return fuzzyResults;
                    }
                }
            }
        }
        
        return results;
    }

    @Override
    public Page<ProductSummaryResponse> searchProductsByName(String name, Pageable pageable) {
        return productRepository.findProductSummaryByName(name, pageable);
    }

    @Override
    public ProductResponse createProduct(ProductCreateRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new NotFoundException("Brand not found with id: " + request.getBrandId()));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + request.getCategoryId()));

        if (productRepository.existsByName(request.getName())) {
            throw new ConflictException("Product name already exists.");
        }

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setBrand(brand);
        product.setCategory(category);

        Product saved = productRepository.save(product);
        return mapToProductResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new NotFoundException("Brand not found with id: " + request.getBrandId()));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + request.getCategoryId()));

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
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    @Override
    public List<TopProductResponse> getTopSellingProducts(int limit) {
        return orderDetailRepository.findTopSellingProducts(PageRequest.of(0, limit));
    }

    @Override
    public List<TopProductResponse> getNewestProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        return productRepository.findAll(pageable).getContent().stream()
                .map(p -> new TopProductResponse(
                        p.getId(),
                        p.getName(),
                        p.getImage(),
                        p.getVariants().stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO),
                        p.getVariants().stream().map(ProductVariant::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO),
                        0L
                ))
                .toList();
    }
    // Smart search algorithm - allows up to 2 character differences
    private String correctSearchKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return null;
        
        String normalized = keyword.toLowerCase().trim();
        
        // Quick common typo corrections for performance
        normalized = applyQuickCorrections(normalized);
        
        return normalized;
    }
    
    private String applyQuickCorrections(String keyword) {
        // Most common typos for performance optimization
        return keyword.replace("samung", "samsung")
                      .replace("samsun", "samsung")
                      .replace("ipone", "iphone")
                      .replace("ihone", "iphone")
                      .replace("macbok", "macbook");
    }
    
    // Generate fuzzy search variations (missing/extra characters)
    private List<String> generateFuzzyVariations(String keyword) {
        List<String> variations = new ArrayList<>();
        variations.add(keyword); // Original
        
        if (keyword.length() >= 3) {
            // Remove 1 character at different positions
            for (int i = 0; i < keyword.length(); i++) {
                String removed = keyword.substring(0, i) + keyword.substring(i + 1);
                if (removed.length() >= 2) {
                    variations.add(removed);
                }
            }
            
            // Remove 2 characters (combinations)
            for (int i = 0; i < keyword.length() - 1; i++) {
                for (int j = i + 1; j < keyword.length(); j++) {
                    String removed = keyword.substring(0, i) + 
                                   keyword.substring(i + 1, j) + 
                                   keyword.substring(j + 1);
                    if (removed.length() >= 2) {
                        variations.add(removed);
                    }
                }
            }
        }
        
        return variations.stream().distinct().toList();
    }

    @Override
    public List<ProductSummaryResponse> getRelatedProductsByPriority(
            Long categoryId,
            Long brandId,
            Long currentProductId,
            Integer totalStock,
            java.time.LocalDateTime createdAt
    ) {
        if (currentProductId == null) {
            throw new NotFoundException("Current product id is required.");
        }

        // We rely on DB aggregation to enforce stock > 0 and ordering by createdAt.
        // totalStock/createdAt inputs are not used for filtering; they are derived from DB state.
        Pageable pageable = PageRequest.of(0, 5);
        return productRepository.findRelatedProductsByPriority(
                currentProductId,
                categoryId,
                brandId,
                pageable
        );
    }

    @Override
    public List<ProductSummaryResponse> getRelatedProductsForProduct(Long productId, int limit) {
        if (productId == null) {
            throw new NotFoundException("Product id is required.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        Long brandId = product.getBrand() != null ? product.getBrand().getBrandId() : null;
        int safeLimit = limit > 0 ? Math.min(limit, 5) : 5;

        return productRepository.findRelatedProductsByPriority(
                productId,
                categoryId,
                brandId,
                PageRequest.of(0, safeLimit)
        );
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .image(product.getImage())
                .createdAt(product.getCreatedAt())
                .category(CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .build())
                .brand(BrandResponse.builder()
                        .brandId(product.getBrand().getBrandId())
                        .brandName(product.getBrand().getBrandName())
                        .build())
                .variants(product.getVariants().stream()
                        .map(v -> VariantResponse.builder()
                                .id(v.getId())
                                .name(v.getName())
                                .sku(v.getSku())
                                .price(v.getPrice())
                                .stock(v.getStock())
                                .description(v.getDescription())
                                .attributes(v.getAttributeValues().stream()
                                        .map(av -> VariantAttributeResponse.builder()
                                                .attributeId(av.getAttribute().getAttributeId())
                                                .attributeName(av.getAttribute().getAttributeName())
                                                .value(av.getValue())
                                                .build())
                                        .toList())
                                .build())
                        .toList())
                .minPrice(product.getVariants().stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO))
                .maxPrice(product.getVariants().stream().map(ProductVariant::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO))
                .totalStock(product.getVariants().stream().mapToInt(ProductVariant::getStock).sum())
                .build();
    }
}
