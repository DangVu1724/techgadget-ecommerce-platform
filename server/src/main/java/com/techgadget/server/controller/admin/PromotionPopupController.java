package com.techgadget.server.controller.admin;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.popup.PromotionPopupRequest;
import com.techgadget.server.model.dto.popup.PromotionPopupResponse;
import com.techgadget.server.service.FileStorageService;
import com.techgadget.server.service.PromotionPopupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/popups")
@RequiredArgsConstructor
public class PromotionPopupController {

    private final PromotionPopupService promotionPopupService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionPopupResponse>>> getAllPopups() {
        return ResponseEntity.ok(ApiResponse.success(
                "Popups retrieved successfully.",
                promotionPopupService.getAllPopups()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionPopupResponse>> getPopupById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Popup retrieved successfully.",
                promotionPopupService.getPopupById(id)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionPopupResponse>> createPopup(
            @Valid @RequestBody PromotionPopupRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Popup created successfully.",
                promotionPopupService.createPopup(request)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionPopupResponse>> updatePopup(
            @PathVariable Long id,
            @Valid @RequestBody PromotionPopupRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Popup updated successfully.",
                promotionPopupService.updatePopup(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePopup(@PathVariable Long id) {
        promotionPopupService.deletePopup(id);
        return ResponseEntity.ok(ApiResponse.success("Popup deleted successfully.", null));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadPopupImage(@RequestPart("file") MultipartFile file) {
        String url = fileStorageService.store(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully.", url));
    }
}
