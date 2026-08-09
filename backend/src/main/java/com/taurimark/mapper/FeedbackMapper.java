package com.taurimark.mapper;

import com.taurimark.entity.Feedback;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface FeedbackMapper {

    @Select("SELECT * FROM feedback WHERE user_id = #{userId} ORDER BY created_at DESC")
    @Results({
        @Result(property = "userId", column = "user_id"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "updatedAt", column = "updated_at")
    })
    List<Feedback> findByUserId(@Param("userId") Long userId);

    @Select("SELECT * FROM feedback WHERE id = #{id} AND user_id = #{userId}")
    @Results({
        @Result(property = "userId", column = "user_id"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "updatedAt", column = "updated_at")
    })
    Feedback findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Insert("INSERT INTO feedback(user_id, title, content, status, created_at, updated_at) " +
            "VALUES(#{userId}, #{title}, #{content}, #{status}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Feedback feedback);

    @Update("UPDATE feedback SET title=#{title}, content=#{content}, updated_at=#{updatedAt} WHERE id=#{id} AND user_id=#{userId}")
    int update(Feedback feedback);

    @Delete("DELETE FROM feedback WHERE id=#{id} AND user_id=#{userId}")
    int delete(@Param("id") Long id, @Param("userId") Long userId);
}
