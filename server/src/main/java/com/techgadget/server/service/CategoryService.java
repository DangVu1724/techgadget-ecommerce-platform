package com.techgadget.server.service;

import com.techgadget.server.model.dto.category.CategoryRequest;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.entity.Category;
import com.techgadget.server.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getCategories() {
        return  categoryRepository.findAll().stream().map(category -> {
            CategoryResponse categoryResponse = new CategoryResponse();
            categoryResponse.setId(category.getId());
            categoryResponse.setName(category.getName());
            categoryResponse.setDescription(category.getDescription());
            return categoryResponse;
        }).toList();
    }


    public CategoryResponse createCategory(CategoryRequest request) {

        Category Category = new Category();
        Category.setName(request.getName());
        Category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(Category);

        return mapToResponse(saved);
    }

    public CategoryResponse updateCategory(Long CategoryId, CategoryRequest request) {

        Category Category = categoryRepository.findById(CategoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Category.setName(request.getName());
        Category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(Category);

        return mapToResponse(updated);
    }

    public void deleteCategory(Long CategoryId) {

        Category Category = categoryRepository.findById(CategoryId)
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
