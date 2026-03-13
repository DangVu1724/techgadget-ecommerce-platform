package com.techgadget.server.service;

import com.techgadget.server.model.dto.variant.VariantRequest;
import com.techgadget.server.model.dto.variant.VariantResponse;


public interface VariantService {

     VariantResponse createVariant(VariantRequest request);

     VariantResponse updateVariant(Long id, VariantRequest request);

     void deleteVariant(Long id);

}