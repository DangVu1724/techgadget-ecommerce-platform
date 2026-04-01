package com.techgadget.server.service.impl;

import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.variant.VariantAttributeRequest;
import com.techgadget.server.model.dto.variant.VariantAttributeResponse;
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
import jakarta.transaction.Transactional;
import jdk.jfr.TransitionTo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VariantServiceImpl implements VariantService {
    private final VariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final AttributeRepository attributeRepository;

    @Override
    public VariantResponse getCurrentVariant(Long variantId) {
        ProductVariant variant = variantRepository.findDetailById(variantId)
                .orElseThrow(() -> new NotFoundException("Variant not found with id: " + variantId));
        return mapToResponse(variant);
    }

    @Override
    public VariantResponse createVariant(VariantRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + request.getProductId()));

        ProductVariant variant = new ProductVariant();
        variant.setName(request.getName());
        variant.setPrice(request.getPrice());
        variant.setStock(request.getStock());
        variant.setDescription(request.getDescription());
        variant.setProduct(product);

        List<VariantAttributeRequest> normalizedAttributes = normalizeAttributes(request.getAttributes());
        variant.setAttributeValues(buildAttributeValues(variant, normalizedAttributes));

        String sku = generateSku(product, normalizedAttributes);
        variant.setSku(sku);

        ProductVariant saved = variantRepository.save(variant);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public VariantResponse updateVariant(Long id, VariantRequest request) {
        ProductVariant variant = variantRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("Variant not found with id: " + id));

        if (request.getName() != null && !Objects.equals(request.getName(), variant.getName())) {
            variant.setName(request.getName());
        }

        if (request.getPrice() != null && !Objects.equals(request.getPrice(), variant.getPrice())) {
            variant.setPrice(request.getPrice());
        }

        if (request.getStock() != null && !Objects.equals(request.getStock(), variant.getStock())) {
            variant.setStock(request.getStock());
        }

        if (request.getDescription() != null && !Objects.equals(request.getDescription(), variant.getDescription())) {
            variant.setDescription(request.getDescription());
        }

        if (request.getAttributes() != null) {
            List<VariantAttributeRequest> normalizedRequests = normalizeAttributes(request.getAttributes());

            // 1. Map các giá trị hiện có trong DB (Key là attributeId)
            Map<Long, VariantAttributeValue> existingMap = variant.getAttributeValues().stream()
                    .collect(Collectors.toMap(av -> av.getAttribute().getAttributeId(), av -> av));

            // 2. Tạo Set mới để chứa các giá trị sau khi xử lý
            Set<VariantAttributeValue> finalValues = new HashSet<>();

            for (VariantAttributeRequest req : normalizedRequests) {
                if (existingMap.containsKey(req.getAttributeId())) {
                    // NẾU ĐÃ CÓ: Lấy bản ghi cũ và chỉ cập nhật giá trị mới (Tránh lỗi Unique)
                    VariantAttributeValue existingValue = existingMap.get(req.getAttributeId());
                    existingValue.setValue(req.getValue());
                    finalValues.add(existingValue);
                } else {
                    // NẾU CHƯA CÓ: Tạo mới hoàn toàn
                    Attribute attribute = attributeRepository.findById(req.getAttributeId())
                            .orElseThrow(() -> new NotFoundException("Attribute not found: " + req.getAttributeId()));

                    VariantAttributeValue newValue = new VariantAttributeValue();
                    newValue.setVariant(variant);
                    newValue.setAttribute(attribute);
                    newValue.setValue(req.getValue());
                    finalValues.add(newValue);
                }
            }

            // 3. Cập nhật lại danh sách (orphanRemoval sẽ tự xóa những cái không có trong finalValues)
            variant.getAttributeValues().clear();
            variant.getAttributeValues().addAll(finalValues);

            variant.setSku(generateSku(variant.getProduct(), normalizedRequests));
        }
        System.out.println(">>> DEBUG SKU CREATED: " + variant.getSku() + " (Length: " + variant.getSku().length() + ")");
        ProductVariant updated = variantRepository.save(variant);
        return mapToResponse(updated);
    }

    @Override
    public void deleteVariant(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Variant not found with id: " + id));
        variantRepository.delete(variant);
    }

    private Set<VariantAttributeValue> buildAttributeValues(ProductVariant variant,
            List<VariantAttributeRequest> attributes) {
        Set<VariantAttributeValue> attributeValues = new HashSet<>();
        for (VariantAttributeRequest attr : attributes) {
            Attribute attribute = attributeRepository.findById(attr.getAttributeId())
                    .orElseThrow(() -> new NotFoundException("Attribute not found with id: " + attr.getAttributeId()));

            VariantAttributeValue value = new VariantAttributeValue();
            value.setVariant(variant);
            value.setAttribute(attribute);
            value.setValue(attr.getValue());
            attributeValues.add(value);
        }
        return attributeValues;
    }

    private List<VariantAttributeRequest> normalizeAttributes(List<VariantAttributeRequest> attributes) {
        if (attributes == null || attributes.isEmpty()) {
            return List.of();
        }

        return attributes.stream()
                .filter(attr -> attr != null && attr.getAttributeId() != null && attr.getValue() != null
                        && !attr.getValue().isBlank())
                .collect(Collectors.toMap(
                        VariantAttributeRequest::getAttributeId,
                        Function.identity(),
                        (first, second) -> second))
                .values()
                .stream()
                .toList();
    }

    private VariantResponse mapToResponse(ProductVariant variant) {
        VariantResponse response = new VariantResponse();
        response.setId(variant.getId());
        response.setName(variant.getName());
        response.setSku(variant.getSku());
        response.setPrice(variant.getPrice());
        response.setStock(variant.getStock());
        response.setSold(variant.getSoldCount());
        response.setDescription(variant.getDescription());
        response.setAttributes(variant.getAttributeValues().stream()
                .map(av -> VariantAttributeResponse.builder()
                        .attributeId(av.getAttribute().getAttributeId())
                        .attributeName(av.getAttribute().getAttributeName())
                        .value(av.getValue())
                        .build())
                .toList());
        response.setProductId(variant.getProduct().getId());
        response.setProductName(variant.getProduct().getName());
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

    private int getAttributePriority(String attributeName) {
        return switch (normalizeToken(attributeName)) {
            case "COLOR" -> 0;
            case "RAM" -> 1;
            case "STORAGE" -> 2;
            case "CAPACITY" -> 3;
            case "SIZE" -> 4;
            default -> 99;
        };
    }

    private String normalizeToken(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9]+", "")
                .toUpperCase(Locale.ROOT);
    }

    private String abbreviateWord(String word) {
        return switch (word) {
            case "BLACK" -> "BLK";
            case "WHITE" -> "WHT";
            case "SILVER" -> "SLV";
            case "GOLD" -> "GLD";
            case "GRAY", "GREY" -> "GRY";
            case "PURPLE" -> "PRP";
            case "PINK" -> "PNK";
            case "GREEN" -> "GRN";
            case "YELLOW" -> "YLW";
            case "ORANGE" -> "ORG";
            case "RED" -> "RED";
            case "BLUE" -> "BLU";
            case "BROWN" -> "BRN";
            case "WIRELESS" -> "WLS";
            case "BLUETOOTH" -> "BT";
            case "NOISECANCELLING" -> "NC";
            case "NOISECANCELING" -> "NC";
            default -> word.length() <= 4 ? word : word.substring(0, 4);
        };
    }

    private String encodeAttributeValue(String value) {
        String normalized = normalizeToken(value);
        if (normalized.isEmpty()) {
            return "NA";
        }

        if (normalized.matches("\\d+TB|\\d+GB|\\d+MHZ|\\d+HZ")) {
            return normalized;
        }

        if (normalized.matches("\\d+")) {
            return normalized;
        }

        if (normalized.matches("[A-Z]+\\d+")) {
            return normalized;
        }

        String[] words = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT)
                .trim()
                .split("[^A-Z0-9]+");

        StringBuilder token = new StringBuilder();
        for (String word : words) {
            if (word.isBlank()) {
                continue;
            }
            token.append(abbreviateWord(word));
            if (token.length() >= 12) {
                break;
            }
        }

        if (token.isEmpty()) {
            return normalized.substring(0, Math.min(12, normalized.length()));
        }

        return token.substring(0, Math.min(12, token.length()));
    }

    public String generateSku(Product product, List<VariantAttributeRequest> attributes) {
        String modelCode = generateModelCode(product.getName());
        if (attributes == null || attributes.isEmpty()) {
            return modelCode;
        }

        Map<Long, Attribute> attributeMap = attributeRepository.findAllById(
                        attributes.stream()
                                .map(VariantAttributeRequest::getAttributeId)
                                .filter(Objects::nonNull)
                                .toList())
                .stream().collect(Collectors.toMap(Attribute::getAttributeId, Function.identity()));

        String attributeCode = attributes.stream()
                .filter(attr -> {
                    // Lấy tên attribute từ map
                    Attribute entity = attributeMap.get(attr.getAttributeId());
                    if (entity == null) return false;
                    // CHỈ LẤY những attribute quan trọng (Priority < 10)
                    return getAttributePriority(entity.getAttributeName()) < 10;
                })
                .sorted(Comparator.comparingInt(attr -> getAttributePriority(attributeMap.get(attr.getAttributeId()).getAttributeName())))
                .map(attr -> encodeAttributeValue(attr.getValue()))
                .collect(Collectors.joining("-"));

        String finalSku = attributeCode.isBlank() ? modelCode : modelCode + "-" + attributeCode;

        // Fix lỗi validation: Nếu SKU vẫn ngắn hơn 6 ký tự, thêm ID sản phẩm vào sau
        if (finalSku.length() < 6) {
            finalSku = finalSku + "-" + product.getId();
        }

        // Cắt ngắn nếu vượt quá 50 ký tự (giới hạn của DB ông đặt)
        return finalSku.length() > 50 ? finalSku.substring(0, 50) : finalSku;
    }
}