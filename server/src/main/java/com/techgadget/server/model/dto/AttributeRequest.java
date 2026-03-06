package com.techgadget.server.model.dto;

import com.techgadget.server.model.enums.AttributeType;
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
public class AttributeRequest {

    @NotBlank(message = "Tên thuộc tính không được để trống")
    private String attributeName;

    @NotNull(message = "Kiểu dữ liệu không được để trống")
    private AttributeType dataType;
}