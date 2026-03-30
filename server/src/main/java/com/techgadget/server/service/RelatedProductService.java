package com.techgadget.server.service;

import com.techgadget.server.model.dto.product.RelatedProductRequest;
import com.techgadget.server.model.dto.product.RelatedProductResponse;

import java.util.List;

public interface RelatedProductService {

    List<RelatedProductResponse> getByProductId(Long productId);

    RelatedProductResponse create(RelatedProductRequest request);

    void delete(Long id);
}
