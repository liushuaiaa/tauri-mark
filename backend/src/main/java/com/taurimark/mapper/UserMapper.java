package com.taurimark.mapper;

import com.taurimark.entity.User;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM sys_user WHERE username = #{username}")
    User findByUsername(@Param("username") String username);

    @Select("SELECT * FROM sys_user WHERE id = #{id}")
    User findById(@Param("id") Long id);

    @Insert("INSERT INTO sys_user(username, password, created_at, updated_at) " +
            "VALUES(#{username}, #{password}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);
}
