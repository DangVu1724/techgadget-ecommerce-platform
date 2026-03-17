package com.techgadget.server.controller;

import com.techgadget.server.model.entity.User;
import com.techgadget.server.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.techgadget.server.model.dto.LoginRequest;
import com.techgadget.server.model.dto.RegisterRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")

    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        this.authService.register(request);
        return ResponseEntity.ok("Register successfully") ;
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request){
       this.authService.login(request);
        return "login successfully";
    }
}