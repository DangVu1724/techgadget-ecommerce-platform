package com.techgadget.server.service.impl;

import com.techgadget.server.exception.ConflictException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.product.ProductAttributeFilterResponse;
import com.techgadget.server.model.dto.product.ProductCreateRequest;
import com.techgadget.server.model.dto.product.ProductResponse;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.dto.product.ProductUpdateRequest;
import com.techgadget.server.model.dto.product.TopProductResponse;
import com.techgadget.server.model.entity.Brand;
import com.techgadget.server.model.entity.Category;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.repository.BrandRepository;
import com.techgadget.server.repository.CategoryRepository;
import com.techgadget.server.repository.OrderDetailRepository;
import com.techgadget.server.repository.ProductRepository;
import com.techgadget.server.service.ProductService;
import com.techgadget.server.service.support.ProductFilterSupport;
import com.techgadget.server.service.support.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductFilterSupport productFilterSupport;
    private final ProductMapper productMapper;

    @Override
    public Page<ProductSummaryResponse> getProducts(Pageable pageable) {
        return productRepository.findProductSummary(pageable);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return productRepository.findProductDetail(id)
                .map(productMapper::toProductResponse)
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
            Map<String, List<String>> attributeFilters
    ) {
        String smartKeyword = correctSearchKeyword(keyword);
        Page<ProductSummaryResponse> results = productFilterSupport.findFilteredProductSummaries(
                pageable,
                smartKeyword,
                brandId,
                categoryId,
                minPrice,
                maxPrice,
                attributeFilters
        );

        if (results.isEmpty() && keyword != null && keyword.trim().length() >= 3) {
            for (String variation : generateFuzzyVariations(smartKeyword)) {
                if (variation.equals(smartKeyword)) {
                    continue;
                }

                Page<ProductSummaryResponse> fuzzyResults = productFilterSupport.findFilteredProductSummaries(
                        pageable,
                        variation,
                        brandId,
                        categoryId,
                        minPrice,
                        maxPrice,
                        attributeFilters
                );

                if (!fuzzyResults.isEmpty()) {
                    return fuzzyResults;
                }
            }
        }

        return results;
    }

    @Override
    public List<ProductAttributeFilterResponse> getAvailableFilters(Long categoryId, Long brandId) {
        return productFilterSupport.getAvailableFilters(categoryId, brandId);
    }

    @Override
    public Page<ProductSummaryResponse> searchProductsByName(String name, Pageable pageable) {
        String smartKeyword = correctSearchKeyword(name);
        Page<ProductSummaryResponse> results = productFilterSupport.searchProductsByName(smartKeyword, pageable);

        if (results.isEmpty() && name != null && name.trim().length() >= 3) {
            for (String variation : generateFuzzyVariations(smartKeyword)) {
                if (variation.equals(smartKeyword)) {
                    continue;
                }

                Page<ProductSummaryResponse> fuzzyResults = productFilterSupport.searchProductsByName(variation, pageable);
                if (!fuzzyResults.isEmpty()) {
                    return fuzzyResults;
                }
            }
        }

        return results;
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
        return productMapper.toProductResponse(saved);
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
        return productMapper.toProductResponse(updated);
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
                        0L,
                        p.getAverageRating(),
                        p.getTotalReviews()
                ))
                .toList();
    }

    private String correctSearchKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }

        return applyQuickCorrections(keyword.toLowerCase().trim());
    }

    private String applyQuickCorrections(String keyword) {
        return keyword.replace("samung", "samsung")
                .replace("samsun", "samsung")
                .replace("ipone", "iphone")
                .replace("ihone", "iphone")
                .replace("macbok", "macbook");
    }

    private List<String> generateFuzzyVariations(String keyword) {
        if (keyword == null || keyword.length() < 3) {
            return List.of(keyword);
        }

        List<String> variations = new ArrayList<>();
        variations.add(keyword);

        for (int i = 0; i < keyword.length(); i++) {
            String removed = keyword.substring(0, i) + keyword.substring(i + 1);
            if (removed.length() >= 2) {
                variations.add(removed);
            }
        }

        for (int i = 0; i < keyword.length() - 1; i++) {
            for (int j = i + 1; j < keyword.length(); j++) {
                String removed = keyword.substring(0, i)
                        + keyword.substring(i + 1, j)
                        + keyword.substring(j + 1);
                if (removed.length() >= 2) {
                    variations.add(removed);
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
            LocalDateTime createdAt
    ) {
        if (currentProductId == null) {
            throw new NotFoundException("Current product id is required.");
        }

        return productRepository.findRelatedProductsByPriority(
                currentProductId,
                categoryId,
                brandId,
                PageRequest.of(0, 5)
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
}
