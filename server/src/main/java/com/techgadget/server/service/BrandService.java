package com.techgadget.server.service;

import com.techgadget.server.model.dto.BrandResponse;
import com.techgadget.server.model.entity.Brand;
import com.techgadget.server.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {
    @Autowired
    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<BrandResponse> getAllBrands(){

        return brandRepository.findAll().stream().map(brand -> {
            BrandResponse dto = new BrandResponse();
            dto.setBrandId(brand.getBrandId());
            dto.setBrandName(brand.getBrandName());
            dto.setCreatedAt(brand.getCreatedAt());
            return dto;
        }).toList();

    }
}
