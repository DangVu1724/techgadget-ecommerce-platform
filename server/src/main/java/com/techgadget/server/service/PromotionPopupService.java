package com.techgadget.server.service;

import com.techgadget.server.model.dto.popup.PromotionPopupRequest;
import com.techgadget.server.model.dto.popup.PromotionPopupResponse;

import java.util.List;

public interface PromotionPopupService {

    List<PromotionPopupResponse> getAllPopups();

    PromotionPopupResponse getPopupById(Long id);

    PromotionPopupResponse createPopup(PromotionPopupRequest request);

    PromotionPopupResponse updatePopup(Long id, PromotionPopupRequest request);

    void deletePopup(Long id);

    PromotionPopupResponse getActivePopup();
}
