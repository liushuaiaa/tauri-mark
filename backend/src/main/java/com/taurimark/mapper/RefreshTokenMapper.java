package com.taurimark.mapper;

import com.taurimark.entity.RefreshToken;
import org.apache.ibatis.annotations.*;

@Mapper
public interface RefreshTokenMapper {
    @Insert("INSERT INTO refresh_tokens(user_id, token_hash, expires_at) " +
            "VALUES(#{userId}, #{tokenHash}, #{expiresAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(RefreshToken refreshToken);

    @Select("SELECT * FROM refresh_tokens WHERE token_hash = #{tokenHash}")
    RefreshToken findByTokenHash(@Param("tokenHash") String tokenHash);

    @Update("UPDATE refresh_tokens SET revoked = 1, updated_at = NOW() WHERE id = #{id} AND revoked = 0")
    int revokeById(@Param("id") Long id);

    @Update("UPDATE refresh_tokens SET revoked = 1, updated_at = NOW() WHERE token_hash = #{tokenHash} AND revoked = 0")
    int revokeByTokenHash(@Param("tokenHash") String tokenHash);

    @Update("UPDATE refresh_tokens SET revoked = 1, updated_at = NOW() WHERE user_id = #{userId} AND revoked = 0")
    int revokeAllByUserId(@Param("userId") Long userId);
}
