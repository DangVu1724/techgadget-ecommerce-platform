package com.techgadget.server.service;

import com.techgadget.server.model.dto.product.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


public interface ProductService {

     Page<ProductSummaryResponse> getProducts(Pageable pageable);

     ProductResponse getProductById(Long id);
     Page<ProductSummaryResponse> filterProducts(Pageable pageable, String keyword, Long brandId, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String ram, String storage);

     Page<ProductSummaryResponse> searchProductsByName(String name, Pageable pageable);

     ProductResponse createProduct(ProductCreateRequest request);

     ProductResponse updateProduct(Long id, ProductUpdateRequest request);

     void deleteProduct(Long id);

     List<TopProductResponse> getTopSellingProducts(int limit);

     List<TopProductResponse> getNewestProducts(int limit);

     List<ProductSummaryResponse> getRelatedProductsByPriority(
             Long categoryId,
             Long brandId,
             Long currentProductId,
             Integer totalStock,
             LocalDateTime createdAt
     );

     List<ProductSummaryResponse> getRelatedProductsForProduct(Long productId, int limit);


}
