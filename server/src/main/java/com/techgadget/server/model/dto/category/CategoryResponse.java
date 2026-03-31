package com.techgadget.server.model.dto.category;

import com.techgadget.server.model.dto.attribute.AttributeResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Set<Long> attributeIds;
    private List<AttributeResponse> attributes;
}
