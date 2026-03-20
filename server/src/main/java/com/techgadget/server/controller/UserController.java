package com.techgadget.server.controller;

import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/adminuser")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetAdmin() {
        userService.updateAdminPassword(2L, "admin123");
        return ResponseEntity.ok(ApiResponse.success("Admin password reset successfully.", null));
    }
}
