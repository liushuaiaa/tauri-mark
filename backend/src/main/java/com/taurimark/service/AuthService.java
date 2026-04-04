package com.taurimark.service;

import com.taurimark.config.JwtUtil;
import com.taurimark.dto.AuthResponse;
import com.taurimark.dto.LoginRequest;
import com.taurimark.dto.RegisterRequest;
import com.taurimark.entity.User;
import com.taurimark.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        User existingUser = userMapper.findByUsername(request.getUsername());
        if (existingUser != null) {
            throw new RuntimeException("用户名已存在");
        }

        // Create new user (password is already SHA-256 hashed by frontend)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());

        userMapper.insert(user);

        // Generate token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userMapper.findByUsername(request.getUsername());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // Password is already SHA-256 hashed by frontend, compare directly
        if (!request.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getId());
    }

    public User getCurrentUser(Long userId) {
        return userMapper.findById(userId);
    }
}
