package com.techgadget.server.service;

import com.techgadget.server.model.dto.attribute.AttributeRequest;
import com.techgadget.server.model.dto.attribute.AttributeResponse;
import java.util.List;

public interface AttributeService {
    List<AttributeResponse> getAllAttributes();

    AttributeResponse getAttributeById(Long id);

    AttributeResponse createAttribute(AttributeRequest attributeRequest);

    AttributeResponse updateAttribute(Long id, AttributeRequest attributeRequest);

    void deleteAttribute(Long id);
}