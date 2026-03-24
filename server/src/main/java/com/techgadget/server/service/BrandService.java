package com.techgadget.server.service;

import com.techgadget.server.model.dto.brand.BrandRequest;
import com.techgadget.server.model.dto.brand.BrandResponse;

import java.util.List;


public interface BrandService {

    List<BrandResponse> getAllBrands();

    List<BrandResponse> getAllBrandsByCategoryId(Long id);

    List<BrandResponse> searchByName(String name);

    BrandResponse createBrand(BrandRequest request);

    BrandResponse updateBrand(Long brandId, BrandRequest request);

    void deleteBrand(Long brandId);

}