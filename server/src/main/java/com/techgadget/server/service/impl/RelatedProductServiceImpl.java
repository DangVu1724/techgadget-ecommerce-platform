package com.techgadget.server.service.impl;

import com.techgadget.server.exception.BusinessException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.dto.product.RelatedProductRequest;
import com.techgadget.server.model.dto.product.RelatedProductResponse;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.model.entity.RelatedProduct;
import com.techgadget.server.repository.ProductRepository;
import com.techgadget.server.repository.RelatedProductRepository;
import com.techgadget.server.service.RelatedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RelatedProductServiceImpl implements RelatedProductService {

    private static final int MAX_RELATED_PRODUCTS = 5;

    private final RelatedProductRepository relatedProductRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RelatedProductResponse> getByProductId(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        return relatedProductRepository.findByProductIdOrderByDisplayOrderAsc(productId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public RelatedProductResponse create(RelatedProductRequest request) {
        if (request.getProductId().equals(request.getRelatedProductId())) {
            throw new BusinessException("A product cannot be related to itself.");
        }

        long relatedCount = relatedProductRepository.countByProductId(request.getProductId());
        if (relatedCount >= MAX_RELATED_PRODUCTS) {
            throw new BusinessException("Maximum 5 related products allowed per product.");
        }

        if (relatedProductRepository.existsByProductIdAndRelatedProductId(request.getProductId(), request.getRelatedProductId())) {
            throw new BusinessException("This related product already exists.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + request.getProductId()));
        Product relatedProduct = productRepository.findById(request.getRelatedProductId())
                .orElseThrow(() -> new NotFoundException("Related product not found with id: " + request.getRelatedProductId()));

        RelatedProduct relation = new RelatedProduct();
        relation.setProduct(product);
        relation.setRelatedProduct(relatedProduct);
        relation.setDisplayOrder(resolveDisplayOrder(request.getProductId(), request.getDisplayOrder()));

        return toResponse(relatedProductRepository.save(relation));
    }

    @Override
    public void delete(Long id) {
        RelatedProduct relation = relatedProductRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Related product mapping not found with id: " + id));

        Long productId = relation.getProduct().getId();
        Integer removedOrder = relation.getDisplayOrder();

        relatedProductRepository.delete(relation);

        List<RelatedProduct> shiftedItems = relatedProductRepository
                .findByProductIdAndDisplayOrderGreaterThanOrderByDisplayOrderAsc(productId, removedOrder);

        shiftedItems.forEach(item -> item.setDisplayOrder(item.getDisplayOrder() - 1));
        relatedProductRepository.saveAll(shiftedItems);
    }

    private int resolveDisplayOrder(Long productId, Integer preferredOrder) {
        int maxAllowedOrder = MAX_RELATED_PRODUCTS;
        int nextOrder = relatedProductRepository.findTopByProductIdOrderByDisplayOrderDesc(productId)
                .map(item -> item.getDisplayOrder() + 1)
                .orElse(1);

        if (preferredOrder == null) {
            return Math.min(nextOrder, maxAllowedOrder);
        }

        if (preferredOrder < 1) {
            return 1;
        }

        return Math.min(preferredOrder, maxAllowedOrder);
    }

    private RelatedProductResponse toResponse(RelatedProduct relation) {
        Product product = relation.getRelatedProduct();
        return RelatedProductResponse.builder()
                .id(relation.getId())
                .productId(relation.getProduct().getId())
                .displayOrder(relation.getDisplayOrder())
                .relatedProduct(new ProductSummaryResponse(
                        product.getId(),
                        product.getName(),
                        product.getImage(),
                        product.getVariants().stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO),
                        product.getVariants().stream().mapToLong(ProductVariant::getStock).sum(),
                        product.getCategory() != null ? product.getCategory().getName() : null,
                        product.getBrand() != null ? product.getBrand().getBrandName() : null,
                        product.getCreatedAt()
                ))
                .build();
    }
}
