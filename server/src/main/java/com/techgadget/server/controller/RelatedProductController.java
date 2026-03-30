package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.product.RelatedProductRequest;
import com.techgadget.server.model.dto.product.RelatedProductResponse;
import com.techgadget.server.service.RelatedProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/admin/related-products")
@PreAuthorize("hasAuthority('ADMIN')")
public class RelatedProductController {

    private final RelatedProductService relatedProductService;

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<List<RelatedProductResponse>>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Related products retrieved successfully.",
                relatedProductService.getByProductId(productId)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RelatedProductResponse>> create(@Valid @RequestBody RelatedProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Related product created successfully.",
                relatedProductService.create(request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        relatedProductService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Related product deleted successfully.", null));
    }
}
