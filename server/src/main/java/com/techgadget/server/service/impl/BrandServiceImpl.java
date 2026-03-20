package com.techgadget.server.service.impl;

import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.brand.BrandRequest;
import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.model.entity.Brand;
import com.techgadget.server.repository.BrandRepository;
import com.techgadget.server.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepository brandRepository;

    @Override
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<BrandResponse> getAllBrandsByCategoryId(Long id) {
        return brandRepository.getBrandsByCategory(id).stream().map(brand -> {
            BrandResponse dto = new BrandResponse();
            dto.setBrandId(brand.getBrandId());
            dto.setBrandName(brand.getBrandName());
            return dto;
        }).toList();
    }

    @Override
    public BrandResponse createBrand(BrandRequest request) {
        Brand brand = new Brand();
        brand.setBrandName(request.getBrandName());

        Brand saved = brandRepository.save(brand);
        return mapToResponse(saved);
    }

    @Override
    public BrandResponse updateBrand(Long brandId, BrandRequest request) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new NotFoundException("Brand not found with id: " + brandId));

        brand.setBrandName(request.getBrandName());
        Brand updated = brandRepository.save(brand);

        return mapToResponse(updated);
    }

    @Override
    public void deleteBrand(Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new NotFoundException("Brand not found with id: " + brandId));

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
