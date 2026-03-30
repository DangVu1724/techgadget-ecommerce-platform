package com.techgadget.server.model.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelatedProductResponse {

    private Long id;
    private Long productId;
    private Integer displayOrder;
    private ProductSummaryResponse relatedProduct;
}
