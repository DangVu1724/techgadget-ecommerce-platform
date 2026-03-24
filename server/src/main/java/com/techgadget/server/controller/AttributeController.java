package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.attribute.AttributeRequest;
import com.techgadget.server.model.dto.attribute.AttributeResponse;
import com.techgadget.server.service.AttributeService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/attributes")
@RequiredArgsConstructor
@CrossOrigin
public class AttributeController {

    private final AttributeService attributeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttributeResponse>>> getAllAttributes() {
        return ResponseEntity.ok(ApiResponse.success("Attributes retrieved successfully.", attributeService.getAllAttributes()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AttributeResponse>>> searchAttributesByName(@RequestParam("name") String name) {
        return ResponseEntity.ok(ApiResponse.success("Attributes retrieved successfully.", attributeService.searchAttributesByName(name)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AttributeResponse>> getAttributeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Attribute retrieved successfully.", attributeService.getAttributeById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AttributeResponse>> createAttribute(@Valid @RequestBody AttributeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Attribute created successfully.", attributeService.createAttribute(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AttributeResponse>> updateAttribute(
            @PathVariable Long id,
            @Valid @RequestBody AttributeRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Attribute updated successfully.", attributeService.updateAttribute(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttribute(@PathVariable Long id) {
        attributeService.deleteAttribute(id);
        return ResponseEntity.ok(ApiResponse.success("Attribute deleted successfully.", null));
    }
}
