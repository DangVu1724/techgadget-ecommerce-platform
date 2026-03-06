package com.techgadget.server.model.dto;

import com.techgadget.server.model.dto.AttributeResponse;
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