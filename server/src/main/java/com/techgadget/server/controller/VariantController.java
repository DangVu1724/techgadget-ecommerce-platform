package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.variant.VariantRequest;
import com.techgadget.server.model.dto.variant.VariantResponse;
import com.techgadget.server.service.VariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/variants")
@RequiredArgsConstructor
@CrossOrigin
public class VariantController {

    private final VariantService variantService;

    @GetMapping("/{variantId}")
    public ResponseEntity<ApiResponse<VariantResponse>> getCurrentVariant(@PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.success("Variant retrieved successfully.", variantService.getCurrentVariant(variantId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VariantResponse>> createVariant(@Valid @RequestBody VariantRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Variant created successfully.", variantService.createVariant(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VariantResponse>> updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody VariantRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Variant updated successfully.", variantService.updateVariant(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable Long id) {
        variantService.deleteVariant(id);
        return ResponseEntity.ok(ApiResponse.success("Variant deleted successfully.", null));
    }
}
