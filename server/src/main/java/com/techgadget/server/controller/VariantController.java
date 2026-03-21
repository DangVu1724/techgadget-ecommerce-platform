package com.techgadget.server.controller;

import com.techgadget.server.model.dto.variant.VariantRequest;
import com.techgadget.server.model.dto.variant.VariantResponse;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.service.VariantService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/variants")
@RequiredArgsConstructor
@CrossOrigin
public class VariantController {

    private final VariantService variantService;

    @GetMapping("/{variantId}")
    public ResponseEntity<VariantResponse> getCurrentVariant(@PathVariable Long variantId) {
        VariantResponse response = variantService.getCurrentVariant(variantId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public VariantResponse createVariant(
            @Valid @RequestBody VariantRequest request) {

        return variantService.createVariant(request);


    }

    @PutMapping("/{id}")
    public VariantResponse updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody VariantRequest request) {

        return variantService.updateVariant(id, request);

    }

    @DeleteMapping("/{id}")
    public void deleteVariant(@PathVariable Long id) {
        variantService.deleteVariant(id);

    }

}