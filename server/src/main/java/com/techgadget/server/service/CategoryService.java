package com.techgadget.server.service;

import com.techgadget.server.model.dto.category.CategoryResponse;
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
}
