package com.techgadget.server.service;

import com.techgadget.server.model.dto.attribute.AttributeRequest;
import com.techgadget.server.model.dto.attribute.AttributeResponse;
import com.techgadget.server.model.entity.Attribute;
import com.techgadget.server.repository.AttributeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttributeService {

    private final AttributeRepository attributeRepository;

    // 1. Lấy tất cả attributes
    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 2. Lấy attribute theo ID
    public AttributeResponse getAttributeById(Long id) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy attribute với ID: " + id));
        return convertToResponse(attribute);
    }

    // 3. Thêm attribute mới
    @Transactional
    public AttributeResponse createAttribute(AttributeRequest request) {
        // Kiểm tra tên đã tồn tại chưa
        if (attributeRepository.existsByAttributeName(request.getAttributeName())) {
            throw new RuntimeException("Tên attribute đã tồn tại");
        }

        Attribute attribute = new Attribute();
        attribute.setAttributeName(request.getAttributeName());
        attribute.setDataType(request.getDataType());

        Attribute savedAttribute = attributeRepository.save(attribute);
        return convertToResponse(savedAttribute);
    }

    // 4. Cập nhật attribute
    @Transactional
    public AttributeResponse updateAttribute(Long id, AttributeRequest request) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy attribute với ID: " + id));

        // Kiểm tra tên mới có bị trùng không (nếu đổi tên)
        if (!request.getAttributeName().equals(attribute.getAttributeName()) &&
                attributeRepository.existsByAttributeName(request.getAttributeName())) {
            throw new RuntimeException("Tên attribute đã tồn tại");
        }

        attribute.setAttributeName(request.getAttributeName());
        attribute.setDataType(request.getDataType());

        Attribute updatedAttribute = attributeRepository.save(attribute);
        return convertToResponse(updatedAttribute);
    }

    // 5. Xoá attribute
    @Transactional
    public void deleteAttribute(Long id) {
        if (!attributeRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy attribute với ID: " + id);
        }
        attributeRepository.deleteById(id);
    }

    // Convert từ Entity sang Response DTO
    private AttributeResponse convertToResponse(Attribute attribute) {
        return AttributeResponse.builder()
                .attributeId(attribute.getAttributeId())
                .attributeName(attribute.getAttributeName())
                .dataType(attribute.getDataType())
                .build();
    }
}