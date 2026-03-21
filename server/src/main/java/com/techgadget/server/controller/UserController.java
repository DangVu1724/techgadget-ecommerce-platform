package com.techgadget.server.controller;

import com.techgadget.server.model.entity.User;
import com.techgadget.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.techgadget.server.model.dto.UserSearchResponse;

import java.util.List;

@RestController
@RequestMapping("/adminuser")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/admin/search")
    public List<UserSearchResponse> SearchUserByEmail(@RequestParam("email") String email) {
        return this.userService.searchByEmail(email);
    }
    @GetMapping("/reset-password")
    public String resetAdmin() {
        userService.updateAdminPassword(2L, "admin123");
        return "✅ Reset password admin thành công!";

    }
    @GetMapping("/user")
    public List<User> getAllUser(){
        List<User> getAllUser = this.userService.getAllUser();
        return getAllUser;
    }
}
