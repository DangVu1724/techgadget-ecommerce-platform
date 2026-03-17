package com.techgadget.server.controller;

import com.techgadget.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/adminuser")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;


    @GetMapping("/reset-password")
    public String resetAdmin() {
        userService.updateAdminPassword(2L, "admin123");
        return "✅ Reset password admin thành công!";
    }
}
