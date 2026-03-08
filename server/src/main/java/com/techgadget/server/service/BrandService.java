package com.techgadget.server.service;

import com.techgadget.server.model.dto.brand.BrandRequest;
import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.model.entity.Brand;
import com.techgadget.server.repository.BrandRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream().map(brand -> {
            BrandResponse dto = new BrandResponse();
            dto.setBrandId(brand.getBrandId());
            dto.setBrandName(brand.getBrandName());
            dto.setCreatedAt(brand.getCreatedAt());
            return dto;
        }).toList();
    }

    public BrandResponse createBrand(BrandRequest request) {

        Brand brand = new Brand();
        brand.setBrandName(request.getBrandName());

        Brand saved = brandRepository.save(brand);

        return mapToResponse(saved);
    }

    public BrandResponse updateBrand(Long brandId, BrandRequest request) {

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        brand.setBrandName(request.getBrandName());

        Brand updated = brandRepository.save(brand);

        return mapToResponse(updated);
    }

    public void deleteBrand(Long brandId) {

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        brandRepository.delete(brand);
    }

    private BrandResponse mapToResponse(Brand brand) {
        return BrandResponse.builder()
                .brandId(brand.getBrandId())
                .brandName(brand.getBrandName())
                .createdAt(brand.getCreatedAt())
                .build();
    }
}