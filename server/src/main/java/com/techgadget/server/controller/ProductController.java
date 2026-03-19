package com.techgadget.server.controller;

import com.techgadget.server.model.dto.product.*;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {
    private final ProductService productService;

    @GetMapping()
    public Page<ProductSummaryResponse> filterProducts(
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String ram,
            @RequestParam(required = false) String storage,
            Pageable pageable
    ) {
        return productService.filterProducts(
                pageable,
                brandId,
                categoryId,
                minPrice,
                maxPrice,
                ram,
                storage
        );
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping
    public ProductResponse createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return  productService.createProduct(request);
    }

    @PutMapping("/{id}")
    public ProductResponse updateProduct(@PathVariable Long id,@Valid @RequestBody ProductUpdateRequest request) {
        return productService.updateProduct(id,request);
    }

    @DeleteMapping("/{id}")
    public void deleteProductById(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<TopProductResponse>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<TopProductResponse> products = productService.getTopSellingProducts(limit);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/newest")
    public List<TopProductResponse> getNewest(
            @RequestParam(defaultValue = "5") int limit) {
        return productService.getNewestProducts(limit);
    }




}
