package com.techgadget.server.service.impl;

import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.category.CategoryRequest;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.entity.Attribute;
import com.techgadget.server.model.entity.Category;
import com.techgadget.server.repository.CategoryRepository;
import com.techgadget.server.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream().map(category -> {
            CategoryResponse response = new CategoryResponse();
            response.setId(category.getId());
            response.setName(category.getName());
            response.setDescription(category.getDescription());
            return response;
        }).toList();
    }

    @Override
    public List<CategoryResponse> getCategoriesByBrand(Long brandId) {
        return categoryRepository.getCategoriesByBrand(brandId).stream().map(category -> {
            CategoryResponse response = new CategoryResponse();
            response.setId(category.getId());
            response.setName(category.getName());
            return response;
        }).toList();
    }

    @Override
    public List<CategoryResponse> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCase(name).stream().map(category -> {
            CategoryResponse response = new CategoryResponse();
            response.setId(category.getId());
            response.setName(category.getName());
            response.setDescription(category.getDescription());
            return response;
        }).toList();
    }

    @Override
    public Set<Attribute> getAttributesByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + categoryId));
        return category.getAttributes();
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + categoryId));

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Override
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + categoryId));
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
