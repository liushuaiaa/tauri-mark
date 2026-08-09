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
    @Results({
        @Result(property = "userId", column = "user_id"),
        @Result(property = "tokenHash", column = "token_hash"),
        @Result(property = "expiresAt", column = "expires_at"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "updatedAt", column = "updated_at")
    })
    RefreshToken findByTokenHash(@Param("tokenHash") String tokenHash);

    @Update("UPDATE refresh_tokens SET revoked = 1, updated_at = NOW() WHERE id = #{id} AND revoked = 0")
    int revokeById(@Param("id") Long id);

    @Update("UPDATE refresh_tokens SET revoked = 1, updated_at = NOW() WHERE token_hash = #{tokenHash} AND revoked = 0")
    int revokeByTokenHash(@Param("tokenHash") String tokenHash);

    @Update("UPDATE refresh_tokens SET revoked = 1, updated_at = NOW() WHERE user_id = #{userId} AND revoked = 0")
    int revokeAllByUserId(@Param("userId") Long userId);
}
