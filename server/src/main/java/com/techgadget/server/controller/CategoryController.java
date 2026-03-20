package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.category.CategoryRequest;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.entity.Attribute;
import com.techgadget.server.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@CrossOrigin
@RestController
@RequestMapping("api/category")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully.", categoryService.getCategories()));
    }

    @GetMapping("/{id}/attributes")
    public ResponseEntity<ApiResponse<Set<Attribute>>> getAttributesByCategory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Category attributes retrieved successfully.", categoryService.getAttributesByCategory(id)));
    }

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByBrand(@PathVariable Long brandId) {
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully.", categoryService.getCategoriesByBrand(brandId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createBrand(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category created successfully.", categoryService.createCategory(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully.", categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully.", null));
    }
}
