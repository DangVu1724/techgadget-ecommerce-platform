package com.techgadget.server.service;

import com.techgadget.server.model.dto.LoginRequest;
import com.techgadget.server.model.dto.RegisterRequest;
import com.techgadget.server.model.entity.User;
import com.techgadget.server.model.enums.Role;
import com.techgadget.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // REGISTER

    public User register(RegisterRequest input){


        Optional<User> existingUser = userRepository.findByEmail(input.getEmail());

        if(existingUser.isPresent()){

            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFullName(input.getFullName());
        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setRole(Role.CUSTOMER);

        return userRepository.save(user);
    }

    // LOGIN
    public User login(LoginRequest input){

        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if(!passwordEncoder.matches(input.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }
}