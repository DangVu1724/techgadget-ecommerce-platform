package com.techgadget.server.service;

import com.techgadget.server.model.dto.product.ProductResponse;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<ProductSummaryResponse> getProducts(Pageable pageable) {
        return productRepository.findProductSummary(pageable);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> RuntimeException());
    }


}
