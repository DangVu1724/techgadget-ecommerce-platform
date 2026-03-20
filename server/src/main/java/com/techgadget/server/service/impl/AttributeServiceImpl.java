package com.techgadget.server.service.impl;

import com.techgadget.server.exception.ConflictException;
import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.attribute.AttributeRequest;
import com.techgadget.server.model.dto.attribute.AttributeResponse;
import com.techgadget.server.model.entity.Attribute;
import com.techgadget.server.repository.AttributeRepository;
import com.techgadget.server.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AttributeServiceImpl implements AttributeService {
    private final AttributeRepository attributeRepository;

    @Override
    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttributeResponse getAttributeById(Long id) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attribute not found with id: " + id));
        return convertToResponse(attribute);
    }

    @Override
    public AttributeResponse createAttribute(AttributeRequest request) {
        if (attributeRepository.existsByAttributeName(request.getAttributeName())) {
            throw new ConflictException("Attribute name already exists.");
        }

        Attribute attribute = new Attribute();
        attribute.setAttributeName(request.getAttributeName());
        attribute.setDataType(request.getDataType());

        Attribute savedAttribute = attributeRepository.save(attribute);
        return convertToResponse(savedAttribute);
    }

    @Override
    public AttributeResponse updateAttribute(Long id, AttributeRequest request) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attribute not found with id: " + id));

        if (!request.getAttributeName().equals(attribute.getAttributeName())
                && attributeRepository.existsByAttributeName(request.getAttributeName())) {
            throw new ConflictException("Attribute name already exists.");
        }

        attribute.setAttributeName(request.getAttributeName());
        attribute.setDataType(request.getDataType());

        Attribute updatedAttribute = attributeRepository.save(attribute);
        return convertToResponse(updatedAttribute);
    }

    @Override
    public void deleteAttribute(Long id) {
        if (!attributeRepository.existsById(id)) {
            throw new NotFoundException("Attribute not found with id: " + id);
        }
        attributeRepository.deleteById(id);
    }

    private AttributeResponse convertToResponse(Attribute attribute) {
        return AttributeResponse.builder()
                .attributeId(attribute.getAttributeId())
                .attributeName(attribute.getAttributeName())
                .dataType(attribute.getDataType())
                .build();
    }
}
