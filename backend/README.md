# Tauri Mark 后端

基于 Spring Boot + MySQL 的后端 API 服务

## 环境要求

- JDK 17+
- MySQL 8.0+
- Maven 3.6+

## 数据库配置

1. 创建数据库:
```sql
CREATE DATABASE IF NOT EXISTS tauri_mark DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 或者直接运行 `sql/schema.sql` 文件

## 运行

```bash
# 编译
mvn clean package

# 运行
mvn spring-boot:run

# 或运行打包后的 jar
java -jar target/tauri-mark-backend-0.0.1-SNAPSHOT.jar
```

## API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 记事本
- `GET /api/memos` - 获取所有记事本
- `GET /api/memos/{id}` - 获取单个记事本
- `POST /api/memos` - 创建记事本
- `PUT /api/memos/{id}` - 更新记事本
- `DELETE /api/memos/{id}` - 删除到回收站

### 回收站
- `GET /api/memos/trash` - 获取回收站
- `POST /api/memos/trash/{id}/restore` - 恢复
- `DELETE /api/memos/trash/empty` - 清空回收站
- `DELETE /api/memos/trash/cleanup?days=7` - 清理指定天数前的

## 前端配置

前端 `.env` 文件:
```
VITE_API_BASE_URL=http://localhost:8080
```
