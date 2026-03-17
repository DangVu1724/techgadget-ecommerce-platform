package com.techgadget.server.controller;

import com.techgadget.server.model.dto.attribute.AttributeRequest;
import com.techgadget.server.model.dto.attribute.AttributeResponse;
import com.techgadget.server.service.AttributeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attributes")
@RequiredArgsConstructor
@CrossOrigin
public class AttributeController {

    private final AttributeService attributeService;

    @GetMapping
    public List<AttributeResponse> getAllAttributes() {
        return attributeService.getAllAttributes();
    }

    @GetMapping("/{id}")
    public AttributeResponse getAttributeById(@PathVariable Long id) {
        return attributeService.getAttributeById(id);
    }

    @PostMapping
    public AttributeResponse createAttribute(@Valid @RequestBody AttributeRequest request) {
        return attributeService.createAttribute(request);
    }

    @PutMapping("/{id}")
    public AttributeResponse updateAttribute(
            @PathVariable Long id,
            @Valid @RequestBody AttributeRequest request) {
        return attributeService.updateAttribute(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteAttribute(@PathVariable Long id) {
        attributeService.deleteAttribute(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Xoá attribute thành công");
        return response;
    }
}