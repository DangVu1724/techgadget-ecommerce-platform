package com.techgadget.server.model.dto.product;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelatedProductRequest {

    @NotNull(message = "Product ID is required.")
    private Long productId;

    @NotNull(message = "Related product ID is required.")
    private Long relatedProductId;

    private Integer displayOrder;
}
