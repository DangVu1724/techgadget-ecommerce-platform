package com.techgadget.server.service.impl;

import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.popup.PromotionPopupRequest;
import com.techgadget.server.model.dto.popup.PromotionPopupResponse;
import com.techgadget.server.model.entity.Coupon;
import com.techgadget.server.model.entity.PromotionPopup;
import com.techgadget.server.repository.CouponRepository;
import com.techgadget.server.repository.PromotionPopupRepository;
import com.techgadget.server.service.PromotionPopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionPopupServiceImpl implements PromotionPopupService {

    private final PromotionPopupRepository promotionPopupRepository;
    private final CouponRepository couponRepository;

    @Override
    public List<PromotionPopupResponse> getAllPopups() {
        return promotionPopupRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PromotionPopupResponse getPopupById(Long id) {
        PromotionPopup popup = promotionPopupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Popup not found with id: " + id));
        return mapToResponse(popup);
    }

    @Override
    public PromotionPopupResponse createPopup(PromotionPopupRequest request) {
        PromotionPopup popup = new PromotionPopup();
        applyRequest(popup, request);
        PromotionPopup saved = promotionPopupRepository.save(popup);
        return mapToResponse(saved);
    }

    @Override
    public PromotionPopupResponse updatePopup(Long id, PromotionPopupRequest request) {
        PromotionPopup popup = promotionPopupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Popup not found with id: " + id));
        applyRequest(popup, request);
        PromotionPopup updated = promotionPopupRepository.save(popup);
        return mapToResponse(updated);
    }

    @Override
    public void deletePopup(Long id) {
        PromotionPopup popup = promotionPopupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Popup not found with id: " + id));
        promotionPopupRepository.delete(popup);
    }

    @Override
    public PromotionPopupResponse getActivePopup() {
        return promotionPopupRepository.findActivePopups(LocalDateTime.now(), PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .map(this::mapToResponse)
                .orElse(null);
    }

    private void applyRequest(PromotionPopup popup, PromotionPopupRequest request) {
        popup.setTitle(request.getTitle());
        popup.setImageUrl(request.getImageUrl());
        popup.setDescription(request.getDescription());
        popup.setIsActive(request.getIsActive());
        popup.setStartDate(request.getStartDate());
        popup.setEndDate(request.getEndDate());
        popup.setProductId(request.getProductId());
        popup.setDisplayDelay(request.getDisplayDelay());

        Long couponId = request.getCouponId();
        if (couponId == null) {
            popup.setCouponId(null);
            return;
        }

        if (!couponRepository.existsById(couponId)) {
            throw new NotFoundException("Coupon not found with id: " + couponId);
        }

        popup.setCouponId(couponId);
    }

    private PromotionPopupResponse mapToResponse(PromotionPopup popup) {
        Coupon coupon = null;
        if (popup.getCouponId() != null) {
            coupon = couponRepository.findById(popup.getCouponId()).orElse(null);
        }

        return PromotionPopupResponse.builder()
                .id(popup.getId())
                .title(popup.getTitle())
                .imageUrl(popup.getImageUrl())
                .couponId(popup.getCouponId())
                .couponCode(coupon != null ? coupon.getCode() : null)
                .productId(popup.getProductId())
                .displayDelay(popup.getDisplayDelay())
                .description(popup.getDescription())
                .isActive(popup.getIsActive())
                .startDate(popup.getStartDate())
                .endDate(popup.getEndDate())
                .build();
    }
}
