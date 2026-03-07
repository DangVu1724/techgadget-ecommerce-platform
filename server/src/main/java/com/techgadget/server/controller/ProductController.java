package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ProductSummaryResponse;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public List<ProductSummaryResponse> getAllProducts() {
        return productService.getAllProducts();
    }
}
