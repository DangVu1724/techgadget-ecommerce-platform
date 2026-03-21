package com.techgadget.server.service;
import com.techgadget.server.model.dto.UserSearchResponse;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public void updateAdminPassword(Long id, String newPassword) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // encode password mới
        user.setPassword(passwordEncoder.encode(newPassword));

        userRepo.save(user);
    }
    public List<UserSearchResponse> searchByEmail(String emailKeyword){
        String keyword = emailKeyword == null?"": emailKeyword.trim();
        if(keyword.isEmpty()){
            return List.of();
        }
        return userRepo.findByEmailContainingIgnoreCase(keyword).stream().map(user -> UserSearchResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                // .status(user.getStatus())
                .build()
        ).toList();
    }
    public List<User> getAllUser(){
        return this.userRepo.findAll();

    }

}
