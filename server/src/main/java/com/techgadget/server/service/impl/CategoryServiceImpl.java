package com.techgadget.server.service.impl;

import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.attribute.AttributeResponse;
import com.techgadget.server.model.dto.category.CategoryRequest;
import com.techgadget.server.model.dto.category.CategoryResponse;
import com.techgadget.server.model.entity.Attribute;
import com.techgadget.server.model.entity.Category;
import com.techgadget.server.repository.AttributeRepository;
import com.techgadget.server.repository.CategoryRepository;
import com.techgadget.server.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final AttributeRepository attributeRepository;

    @Override
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getCategoriesByBrand(Long brandId) {
        return categoryRepository.getCategoriesByBrand(brandId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .toList();
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
        category.setAttributes(resolveAttributes(request.getAttributeIds()));

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + categoryId));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setAttributes(resolveAttributes(request.getAttributeIds()));

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
        List<Attribute> attributes = new ArrayList<>(category.getAttributes());
        attributes.sort(Comparator.comparing(Attribute::getAttributeName, String.CASE_INSENSITIVE_ORDER));

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .attributeIds(attributes.stream()
                        .map(Attribute::getAttributeId)
                        .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll))
                .attributes(attributes.stream()
                        .map(attribute -> AttributeResponse.builder()
                                .attributeId(attribute.getAttributeId())
                                .attributeName(attribute.getAttributeName())
                                .dataType(attribute.getDataType())
                                .build())
                        .toList())
                .build();
    }

    private Set<Attribute> resolveAttributes(Set<Long> attributeIds) {
        if (attributeIds == null || attributeIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        List<Attribute> attributes = attributeRepository.findAllById(attributeIds);
        if (attributes.size() != attributeIds.size()) {
            Set<Long> foundIds = attributes.stream()
                    .map(Attribute::getAttributeId)
                    .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);

            Long missingId = attributeIds.stream()
                    .filter(attributeId -> !foundIds.contains(attributeId))
                    .findFirst()
                    .orElse(null);

            throw new NotFoundException("Attribute not found with id: " + missingId);
        }

        attributes.sort(Comparator.comparing(Attribute::getAttributeName, String.CASE_INSENSITIVE_ORDER));
        return new LinkedHashSet<>(attributes);
    }
}
