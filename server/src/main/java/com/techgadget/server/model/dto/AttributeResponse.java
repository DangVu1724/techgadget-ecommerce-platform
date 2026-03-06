package com.techgadget.server.model.dto;

import com.techgadget.server.model.enums.AttributeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributeResponse {
    private Long attributeId;
    private String attributeName;
    private AttributeType dataType;
}