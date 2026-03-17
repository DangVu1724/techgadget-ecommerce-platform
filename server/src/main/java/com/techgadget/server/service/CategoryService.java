package com.techgadget.server.service;


import com.techgadget.server.model.dto.category.CategoryRequest;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.entity.Attribute;

import java.util.List;
import java.util.Set;

public interface CategoryService {
    List<CategoryResponse> getCategories();

    Set<Attribute> getAttributesByCategory(Long categoryId);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long categoryId,CategoryRequest request);

    void deleteCategory(Long categoryId);

}
