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
    public String register(RegisterRequest input){

        Optional<User> existingUser = userRepository.findByEmail(input.getEmail());

        if(existingUser.isPresent()){
            return "Email đã tồn tại";
        }

        User user = new User();
        user.setFullName(input.getFullName());
        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setRole(Role.CUSTOMER);
        userRepository.save(user);

        return "Đăng ký thành công";
    }

    // LOGIN
    public String login(LoginRequest input){

        Optional<User> user = userRepository.findByEmail(input.getEmail());

        if(user.isEmpty()){
            return "Sai email hoặc password";
        }

        if(!passwordEncoder.matches(input.getPassword(), user.get().getPassword())){
            return "Sai email hoặc password";
        }

        return "Login thành công";
    }
}