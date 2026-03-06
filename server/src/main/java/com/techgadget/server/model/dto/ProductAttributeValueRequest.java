package com.techgadget.server.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAttributeValueRequest {

    @NotNull(message = "ID thuộc tính không được để trống")
    private Long attributeId;

    @NotBlank(message = "Giá trị thuộc tính không được để trống")
    private String value;
}