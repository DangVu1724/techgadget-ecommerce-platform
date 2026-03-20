package com.techgadget.server.controller;

import com.techgadget.server.Util.JwtUtil;
import com.techgadget.server.model.dto.ApiResponse;
import com.techgadget.server.model.dto.LoginRequest;
import com.techgadget.server.model.dto.RegisterRequest;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User registered successfully.", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody LoginRequest request) {
        User user = authService.login(request);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        Map<String, Object> payload = Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "role", user.getRole()
                )
        );

        return ResponseEntity.ok(ApiResponse.success("Login successful.", payload));
    }
}
