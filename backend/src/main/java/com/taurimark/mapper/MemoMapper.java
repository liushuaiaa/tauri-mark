package com.taurimark.mapper;

import com.taurimark.entity.Memo;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface MemoMapper {
    @Select("SELECT * FROM memo WHERE user_id = #{userId} AND deleted_at IS NULL ORDER BY updated_at DESC")
    List<Memo> findByUserId(@Param("userId") Long userId);

    @Select("SELECT * FROM memo WHERE id = #{id} AND user_id = #{userId}")
    Memo findByIdAndUserId(@Param("id") String id, @Param("userId") Long userId);

    @Select("SELECT * FROM memo WHERE user_id = #{userId} AND deleted_at IS NOT NULL ORDER BY deleted_at DESC")
    List<Memo> findTrashedByUserId(@Param("userId") Long userId);

    @Insert("INSERT INTO memo(id, user_id, title, content, created_at, updated_at, encrypted, password_hint, weather_icon, weather_temp) " +
            "VALUES(#{id}, #{userId}, #{title}, #{content}, #{createdAt}, #{updatedAt}, #{encrypted}, #{passwordHint}, #{weatherIcon}, #{weatherTemp})")
    int insert(Memo memo);

    @Update("UPDATE memo SET title=#{title}, content=#{content}, updated_at=#{updatedAt}, " +
            "encrypted=#{encrypted}, password_hint=#{passwordHint}, weather_icon=#{weatherIcon}, weather_temp=#{weatherTemp} " +
            "WHERE id=#{id} AND user_id=#{userId}")
    int update(Memo memo);

    @Update("UPDATE memo SET deleted_at=#{deletedAt} WHERE id=#{id} AND user_id=#{userId}")
    int softDelete(@Param("id") String id, @Param("userId") Long userId, @Param("deletedAt") Long deletedAt);

    @Update("UPDATE memo SET deleted_at=NULL WHERE id=#{id} AND user_id=#{userId}")
    int restore(@Param("id") String id, @Param("userId") Long userId);

    @Delete("DELETE FROM memo WHERE id=#{id} AND user_id=#{userId}")
    int permanentDelete(@Param("id") String id, @Param("userId") Long userId);

    @Delete("DELETE FROM memo WHERE user_id=#{userId} AND deleted_at IS NOT NULL")
    int emptyTrash(@Param("userId") Long userId);

    @Delete("DELETE FROM memo WHERE user_id=#{userId} AND deleted_at IS NOT NULL AND deleted_at < #{cutoff}")
    int cleanupTrash(@Param("userId") Long userId, @Param("cutoff") Long cutoff);
}
