package com.techgadget.server.service;

import com.techgadget.server.model.dto.variant.VariantAttributeRequest;
import com.techgadget.server.model.dto.variant.VariantRequest;
import com.techgadget.server.model.dto.variant.VariantResponse;
import com.techgadget.server.model.entity.Attribute;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.model.entity.VariantAttributeValue;
import com.techgadget.server.repository.AttributeRepository;
import com.techgadget.server.repository.ProductRepository;
import com.techgadget.server.repository.VariantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class VariantService {

    private final VariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final AttributeRepository attributeRepository;

    public VariantResponse createVariant(VariantRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        ProductVariant variant = new ProductVariant();
        variant.setName(request.getName());
        variant.setPrice(request.getPrice());
        variant.setStock(request.getStock());
        variant.setDescription(request.getDescription());
        variant.setProduct(product);

        Set<VariantAttributeValue> attributeValues = new HashSet<>();

        for (VariantAttributeRequest attr : request.getAttributes()) {

            Attribute attribute = attributeRepository.findById(attr.getAttributeId())
                    .orElseThrow(() -> new RuntimeException("Attribute not found"));

            VariantAttributeValue value = new VariantAttributeValue();
            value.setVariant(variant);
            value.setAttribute(attribute);
            value.setValue(attr.getValue());

            attributeValues.add(value);
        }

        variant.setAttributeValues(attributeValues);

        ProductVariant saved = variantRepository.save(variant);

        return mapToResponse(saved);
    }


    public VariantResponse updateVariant(Long id, VariantRequest request) {

        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        variant.setName(request.getName());
        variant.setPrice(request.getPrice());
        variant.setStock(request.getStock());
        variant.setDescription(request.getDescription());

        // Xoá attribute cũ
        variant.getAttributeValues().clear();

        Set<VariantAttributeValue> attributeValues = new HashSet<>();

        for (VariantAttributeRequest attr : request.getAttributes()) {

            Attribute attribute = attributeRepository.findById(attr.getAttributeId())
                    .orElseThrow(() -> new RuntimeException("Attribute not found"));

            VariantAttributeValue value = new VariantAttributeValue();
            value.setVariant(variant);
            value.setAttribute(attribute);
            value.setValue(attr.getValue());

            attributeValues.add(value);
        }

        variant.getAttributeValues().addAll(attributeValues);

        ProductVariant updated = variantRepository.save(variant);

        return mapToResponse(updated);
    }


    public void deleteVariant(Long id) {

        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        variantRepository.delete(variant);
    }


    private VariantResponse mapToResponse(ProductVariant variant) {

        VariantResponse response = new VariantResponse();

        response.setId(variant.getId());
        response.setName(variant.getName());
        response.setPrice(variant.getPrice());
        response.setStock(variant.getStock());
        response.setDescription(variant.getDescription());

        return response;
    }
}