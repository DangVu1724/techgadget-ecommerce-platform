package com.techgadget.server.controller;

import com.techgadget.server.model.dto.UserSearchResponse;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSearchResponse> SearchUserbyEmail(@RequestParam("email") String email){
        return this.userService.searchByEmail(email);
    }
}
