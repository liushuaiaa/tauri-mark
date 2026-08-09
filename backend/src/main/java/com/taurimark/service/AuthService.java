package com.taurimark.service;

import com.taurimark.config.JwtUtil;
import com.taurimark.dto.AuthResponse;
import com.taurimark.dto.LoginRequest;
import com.taurimark.dto.RegisterRequest;
import com.taurimark.entity.RefreshToken;
import com.taurimark.entity.User;
import com.taurimark.mapper.RefreshTokenMapper;
import com.taurimark.mapper.UserMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenMapper refreshTokenMapper;

    public AuthService(UserMapper userMapper, JwtUtil jwtUtil,
                       RefreshTokenService refreshTokenService, RefreshTokenMapper refreshTokenMapper) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.refreshTokenMapper = refreshTokenMapper;
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
        String refreshToken = refreshTokenService.create(user.getId());
        return new AuthResponse(token, refreshToken, user.getUsername(), user.getId());
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
        String refreshToken = refreshTokenService.create(user.getId());
        return new AuthResponse(token, refreshToken, user.getUsername(), user.getId());
    }

    /**
     * 滑动续期：旧 refresh token 校验通过后轮换——签发新 access token + 新 refresh token，
     * 旧 refresh token 作废。
     */
    public AuthResponse refresh(String refreshToken) {
        RefreshToken row = refreshTokenService.findByRawToken(refreshToken);
        if (row == null || Boolean.TRUE.equals(row.getRevoked())) {
            throw new RuntimeException("刷新令牌无效");
        }
        if (row.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("登录已过期");
        }
        User user = userMapper.findById(row.getUserId());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 旧 refresh token 旋转作废（滑动窗口）
        refreshTokenMapper.revokeById(row.getId());
        String newAccessToken = jwtUtil.generateToken(user.getId(), user.getUsername());
        String newRefreshToken = refreshTokenService.create(user.getId());
        return new AuthResponse(newAccessToken, newRefreshToken, user.getUsername(), user.getId());
    }

    public void revokeRefreshToken(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    public User getCurrentUser(Long userId) {
        return userMapper.findById(userId);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        // Password is SHA-256 hashed by frontend, compare directly
        if (!oldPassword.equals(user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }
        userMapper.updatePassword(userId, newPassword);
        // 安全：改密后吊销该用户全部 refresh token（全端下线）
        refreshTokenService.revokeAllForUser(userId);
    }
}
