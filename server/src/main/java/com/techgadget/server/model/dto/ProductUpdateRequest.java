package com.techgadget.server.model.dto;

import com.techgadget.server.model.dto.variant.VariantRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {

    private String name;
    private String description;
    private String image;
    private Long categoryId;
    private Long brandId;

    private List<ProductAttributeValueRequest> attributes;
    private List<VariantRequest> variants;
}