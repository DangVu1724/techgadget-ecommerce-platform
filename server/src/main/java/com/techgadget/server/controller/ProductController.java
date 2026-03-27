package com.techgadget.server.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.product.ProductAttributeFilterResponse;
import com.techgadget.server.model.dto.product.ProductCreateRequest;
import com.techgadget.server.model.dto.product.ProductResponse;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.dto.product.ProductUpdateRequest;
import com.techgadget.server.model.dto.product.TopProductResponse;
import com.techgadget.server.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {
    private static final TypeReference<Map<String, List<Object>>> ATTRIBUTE_FILTERS_TYPE = new TypeReference<>() {};

    private final ProductService productService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductSummaryResponse>>> filterProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String attributeFilters,
            @RequestParam(required = false) String ram,
            @RequestParam(required = false) String storage,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Products retrieved successfully.",
                productService.filterProducts(
                        pageable,
                        keyword,
                        brandId,
                        categoryId,
                        minPrice,
                        maxPrice,
                        parseAttributeFilters(attributeFilters, ram, storage)
                )
        ));
    }

    @GetMapping("/filters")
    public ResponseEntity<ApiResponse<List<ProductAttributeFilterResponse>>> getProductFilters(
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long brandId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Product filters retrieved successfully.",
                productService.getAvailableFilters(categoryId, brandId)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully.", productService.getProductById(id)));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<ProductSummaryResponse>>> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Related products retrieved successfully.",
                productService.getRelatedProductsForProduct(id, limit)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product created successfully.", productService.createProduct(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully.", productService.updateProduct(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProductById(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully.", null));
    }

    @GetMapping("/top-selling")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success("Top selling products retrieved successfully.", productService.getTopSellingProducts(limit)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductSummaryResponse>>> searchByName(
            @RequestParam String name,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully.", productService.searchProductsByName(name, pageable)));
    }

    @GetMapping("/newest")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> getNewest(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Newest products retrieved successfully.", productService.getNewestProducts(limit)));
    }

    private Map<String, List<String>> parseAttributeFilters(String attributeFilters, String ram, String storage) {
        Map<String, List<String>> result = new LinkedHashMap<>();

        if (attributeFilters != null && !attributeFilters.isBlank()) {
            try {
                Map<String, List<Object>> parsed = objectMapper.readValue(attributeFilters, ATTRIBUTE_FILTERS_TYPE);
                parsed.forEach((key, values) -> result.put(key, values == null
                        ? List.of()
                        : values.stream()
                        .map(value -> value == null ? null : String.valueOf(value).trim())
                        .filter(value -> value != null && !value.isBlank())
                        .toList()));
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid attributeFilters payload.", ex);
            }
        }

        mergeLegacyFilter(result, "ram", ram);
        mergeLegacyFilter(result, "storage", storage);

        return result.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .collect(LinkedHashMap::new,
                        (map, entry) -> map.put(entry.getKey(), entry.getValue()),
                        LinkedHashMap::putAll);
    }

    private void mergeLegacyFilter(Map<String, List<String>> result, String key, String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return;
        }

        List<String> values = new ArrayList<>();
        for (String token : rawValue.split(",")) {
            String trimmed = token == null ? null : token.trim();
            if (trimmed != null && !trimmed.isBlank()) {
                values.add(trimmed);
            }
        }

        if (!values.isEmpty()) {
            result.putIfAbsent(key, values);
        }
    }
}
