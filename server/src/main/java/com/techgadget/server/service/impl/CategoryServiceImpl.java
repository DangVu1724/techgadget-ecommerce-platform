package com.techgadget.server.service.impl;

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
        return  categoryRepository.findAll().stream().map(category -> {
            CategoryResponse categoryResponse = new CategoryResponse();
            categoryResponse.setId(category.getId());
            categoryResponse.setName(category.getName());
            categoryResponse.setDescription(category.getDescription());
            return categoryResponse;
        }).toList();
    }

    @Override
    public Set<Attribute> getAttributesByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category not found"));

        return category.getAttributes();
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        Category Category = new Category();
        Category.setName(request.getName());
        Category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(Category);

        return mapToResponse(saved);
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {

        Category Category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Category.setName(request.getName());
        Category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(Category);

        return mapToResponse(updated);
    }

    @Override
    public void deleteCategory(Long categoryId) {

        Category Category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        categoryRepository.delete(Category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
