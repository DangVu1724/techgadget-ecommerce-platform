package com.techgadget.server.model.dto.variant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantAttributeResponse  {
    private Long attributeId;
    private String attributeName;
    private String value;
}