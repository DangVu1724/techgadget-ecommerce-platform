package com.techgadget.server.controller;

import com.techgadget.server.model.dto.brand.BrandRequest;
import com.techgadget.server.model.dto.brand.BrandResponse;
import com.techgadget.server.model.dto.category.CategoryRequest;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("api/category")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> getCategories() {
        return categoryService.getCategories();
    }

    @PostMapping
    public CategoryResponse createBrand(@Valid @RequestBody CategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    public CategoryResponse updateBrand(@PathVariable Long id,@Valid @RequestBody CategoryRequest request) {
        return categoryService.updateCategory(id,request);
    }

    @DeleteMapping("/{id}")
    public void deleteBrand(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
