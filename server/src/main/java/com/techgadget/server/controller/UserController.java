package com.techgadget.server.controller;

import com.techgadget.server.model.entity.User;
import com.techgadget.server.service.UserService;
import lombok.RequiredArgsConstructor;
import com.techgadget.server.model.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.techgadget.server.model.dto.UserSearchResponse;

import java.util.List;

@RestController
@RequestMapping("/api/adminuser")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserSearchResponse>>> searchByEmail(@RequestParam("email") String email) {
        List<UserSearchResponse> results = this.userService.searchByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Success", results));
    }

    @GetMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetAdmin() {
        userService.updateAdminPassword(2L, "admin123");
        return ResponseEntity.ok(ApiResponse.success("Admin password reset successfully.", null));

    }
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<UserSearchResponse>>> getAllUser() {
        List<UserSearchResponse> users = this.userService.getAllUser();
        // Phải bọc trong ApiResponse để Frontend nhận được payload.success và payload.data
        return ResponseEntity.ok(ApiResponse.success("Success", users));
    }
}
