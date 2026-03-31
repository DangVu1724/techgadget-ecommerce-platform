package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.popup.PromotionPopupResponse;
import com.techgadget.server.service.PromotionPopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/popups")
@RequiredArgsConstructor
public class PromotionPopupPublicController {

    private final PromotionPopupService promotionPopupService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<PromotionPopupResponse>> getActivePopup() {
        return ResponseEntity.ok(ApiResponse.success(
                "Active popup retrieved successfully.",
                promotionPopupService.getActivePopup()
        ));
    }
}
