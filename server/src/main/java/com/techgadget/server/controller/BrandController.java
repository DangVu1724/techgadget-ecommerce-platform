package com.techgadget.server.controller;

import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.service.BrandService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("api/brands")
public class BrandController {
    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public List<BrandResponse> getAllBrands() {
        return brandService.getAllBrands();
    }
}
