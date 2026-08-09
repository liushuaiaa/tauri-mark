package com.taurimark.service;

import com.taurimark.entity.RefreshToken;
import com.taurimark.mapper.RefreshTokenMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Component
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 32; // 256-bit 随机

    private final RefreshTokenMapper refreshTokenMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    public RefreshTokenService(RefreshTokenMapper refreshTokenMapper) {
        this.refreshTokenMapper = refreshTokenMapper;
    }

    /**
     * 生成新的 refresh token：明文返回给客户端，DB 只存 SHA-256 哈希。
     */
    public String create(Long userId) {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        String rawToken = HexFormat.of().formatHex(bytes);

        RefreshToken entity = new RefreshToken();
        entity.setUserId(userId);
        entity.setTokenHash(sha256(rawToken));
        entity.setExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpiration)));
        refreshTokenMapper.insert(entity);

        return rawToken;
    }

    /**
     * 按明文 token 查记录（哈希只在此处计算）。
     */
    public RefreshToken findByRawToken(String raw) {
        return refreshTokenMapper.findByTokenHash(sha256(raw));
    }

    /**
     * 吊销指定 refresh token（幂等，空值直接返回）。
     */
    public void revoke(String raw) {
        if (raw == null || raw.isEmpty()) {
            return;
        }
        refreshTokenMapper.revokeByTokenHash(sha256(raw));
    }

    /**
     * 吊销某用户的全部 refresh token。
     */
    public void revokeAllForUser(Long userId) {
        refreshTokenMapper.revokeAllByUserId(userId);
    }

    private String sha256(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
