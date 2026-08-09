package com.taurimark.controller;

import com.taurimark.dto.*;
import com.taurimark.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody RefreshRequest request) {
        try {
            AuthResponse response = authService.refresh(request.getRefreshToken());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            // 401 是给前端「刷新失败→登出」的信号，区别于 login/register 的 400
            return ResponseEntity.status(401).body(ApiResponse.error(401, e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) RefreshRequest request) {
        // 兼容旧客户端：不传 body 也返回 200；传了 refresh token 则吊销（真正退出登录）
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isEmpty()) {
            authService.revokeRefreshToken(request.getRefreshToken());
        }
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
            }
            Long userId = Long.parseLong(auth.getName());
            authService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        Long userId = Long.parseLong(auth.getName());
        var user = authService.getCurrentUser(userId);
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "用户不存在"));
        }
        AuthResponse response = new AuthResponse(null, user.getUsername(), user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
