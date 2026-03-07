package com.techgadget.server.model.dto.attributeValue;

import com.techgadget.server.model.dto.attribute.AttributeResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAttributeValueResponse {
    private Long id;
    private AttributeResponse attribute;
    private String value;
}