package com.techgadget.server.model.dto.product;

import com.techgadget.server.model.dto.attributeValue.ProductAttributeValueRequest;
import com.techgadget.server.model.dto.variant.VariantRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String description;
    private String image;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotNull(message = "Thương hiệu không được để trống")
    private Long brandId;

    private List<ProductAttributeValueRequest> attributes;
    private List<VariantRequest> variants;
}