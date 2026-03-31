package com.techgadget.server.model.dto.popup;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionPopupRequest {

    @NotBlank(message = "Title is required.")
    private String title;

    private String imageUrl;

    private Long couponId;

    private Long productId;

    private Integer displayDelay;

    private String description;

    private Boolean isActive;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
