package com.techgadget.server.service;

import com.techgadget.server.model.dto.product.ProductCreateRequest;
import com.techgadget.server.model.dto.product.ProductUpdateRequest;
import com.techgadget.server.model.dto.product.ProductResponse;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;


public interface ProductService {

     Page<ProductSummaryResponse> getProducts(Pageable pageable);

     ProductResponse getProductById(Long id);

     Page<ProductSummaryResponse> filterProducts(Pageable pageable, Long brandId, Long categoryId, BigDecimal minPrice,
                                                 BigDecimal maxPrice,
                                                 String ram,
                                                 String storage);

     ProductResponse createProduct(ProductCreateRequest request);

     ProductResponse updateProduct(Long id, ProductUpdateRequest request);

     void deleteProduct(Long id);



}
