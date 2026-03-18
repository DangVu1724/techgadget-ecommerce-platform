package com.techgadget.server.service;

import com.techgadget.server.model.dto.UserSearchResponse;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    public List<UserSearchResponse> searchByEmail(String emailKeyword){
        String keyword = emailKeyword == null?"": emailKeyword.trim();
        if(keyword.isEmpty()){
            return List.of();
        }
        return userRepository.findByEmailContainingIgnoreCase(keyword).stream().map(user -> UserSearchResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .build()
        ).toList();
    }


}
