package com.techgadget.server.controller;

import com.techgadget.server.model.dto.brand.BrandRequest;
import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("api/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;

    @GetMapping
    public List<BrandResponse> getAllBrands() {
        return brandService.getAllBrands();
    }

    @GetMapping("/category/{categoryId}")
    public List<BrandResponse> getBrandsByCategoryId(@PathVariable Long categoryId) {
        return  brandService.getAllBrandsByCategoryId(categoryId);
    }

    @PostMapping
    public BrandResponse createBrand(@Valid @RequestBody BrandRequest request) {
        return brandService.createBrand(request);
    }

    @PutMapping("/{id}")
    public BrandResponse updateBrand(@PathVariable Long id,@Valid @RequestBody BrandRequest request) {
        return brandService.updateBrand(id,request);
    }

    @DeleteMapping("/{id}")
    public void deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
    }
}
