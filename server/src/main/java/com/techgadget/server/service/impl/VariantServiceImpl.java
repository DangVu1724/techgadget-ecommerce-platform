package com.techgadget.server.service.impl;

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
import com.techgadget.server.service.VariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VariantServiceImpl implements VariantService {
    private final VariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final AttributeRepository attributeRepository;

    @Override
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

        String sku = generateSku(product,request.getAttributes());
        variant.setSku(sku);

        ProductVariant saved = variantRepository.save(variant);

        return mapToResponse(saved);
    }

    @Override
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

    @Override
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

    public String generateModelCode(String productName) {

        productName = productName.trim();

        if (productName.toLowerCase().startsWith("iphone")) {
            String number = productName.replaceAll("[^0-9]", "");
            return "IP" + number;
        }

        StringBuilder code = new StringBuilder();

        for (String word : productName.split(" ")) {
            if (!word.isEmpty()) {
                code.append(Character.toUpperCase(word.charAt(0)));
            }
        }

        return code.toString();
    }

    public String colorCode(String color) {

        if (color == null) return null;

        return switch (color.toLowerCase()) {
            case "black" -> "BLK";
            case "blue" -> "BLU";
            case "silver" -> "SLV";
            case "gold" -> "GLD";
            default -> color.substring(0,3).toUpperCase();
        };
    }

    private String getAttributeValue(List<VariantAttributeRequest> attributes, Long attributeId) {

        for (VariantAttributeRequest attr : attributes) {
            if (attr.getAttributeId().equals(attributeId)) {
                return attr.getValue();
            }
        }

        return null;
    }

    public String generateSku(Product product, List<VariantAttributeRequest> attributes) {

        String modelCode = generateModelCode(product.getName());

        String color = colorCode(getAttributeValue(attributes, 22L));
        String ram = getAttributeValue(attributes, 8L);
        String storage = getAttributeValue(attributes, 9L);

        if (color != null) {
            return modelCode + "-" + color + "-" + storage;
        }

        return modelCode + "-" + ram + "-" + storage;
    }
}
