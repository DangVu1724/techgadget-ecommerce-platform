package com.techgadget.server.model.dto.popup;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionPopupResponse {

    private Long id;
    private String title;
    private String imageUrl;
    private Long couponId;
    private String couponCode;
    private Long productId;
    private String description;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
