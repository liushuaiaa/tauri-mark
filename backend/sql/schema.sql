-- 创建数据库
CREATE DATABASE IF NOT EXISTS tauri_mark DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tauri_mark;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 记事本表
CREATE TABLE IF NOT EXISTS memo (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
    user_id BIGINT NOT NULL COMMENT '所属用户',
    title VARCHAR(255) DEFAULT '' COMMENT '标题',
    content LONGTEXT COMMENT '内容',
    created_at BIGINT NOT NULL COMMENT '创建时间戳',
    updated_at BIGINT NOT NULL COMMENT '更新时间戳',
    deleted_at BIGINT DEFAULT NULL COMMENT '删除时间戳',
    encrypted BOOLEAN DEFAULT FALSE COMMENT '是否加密',
    password_hint VARCHAR(255) DEFAULT NULL COMMENT '密码提示',
    weather_icon VARCHAR(10) DEFAULT NULL COMMENT '天气图标',
    weather_temp INT DEFAULT NULL COMMENT '温度',
    INDEX idx_user_id (user_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='记事本表';

-- 反馈表
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    user_id BIGINT NOT NULL COMMENT '所属用户',
    title VARCHAR(255) NOT NULL COMMENT '标题',
    content TEXT COMMENT '内容',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING待处理 RESOLVED已解决 CLOSED已关闭',
    created_at BIGINT NOT NULL COMMENT '创建时间戳',
    updated_at BIGINT NOT NULL COMMENT '更新时间戳',
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈表';

-- 刷新令牌表（滑动续期）
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    user_id BIGINT NOT NULL COMMENT '所属用户',
    token_hash VARCHAR(64) NOT NULL COMMENT 'refresh token 的 SHA-256 哈希（十六进制）',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    revoked TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已吊销/已旋转作废',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_token_hash (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='刷新令牌表';
