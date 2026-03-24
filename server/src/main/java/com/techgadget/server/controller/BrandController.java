package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.brand.BrandRequest;
import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("api/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllBrands() {
        return ResponseEntity.ok(ApiResponse.success("Brands retrieved successfully.", brandService.getAllBrands()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> searchByName(@RequestParam("name") String name) {
        List<BrandResponse> results = brandService.searchByName(name);
        return ResponseEntity.ok(ApiResponse.success("Brands retrieved successfully.", results));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getBrandsByCategoryId(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success("Brands retrieved successfully.", brandService.getAllBrandsByCategoryId(categoryId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(@Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Brand created successfully.", brandService.createBrand(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Brand updated successfully.", brandService.updateBrand(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully.", null));
    }
}
