---
quick_id: 260809-q0t
slug: sliding-token-refresh
description: 实现滑动续期：后端加 refresh token 机制（DB 存储、登录时签发、过期自动换新），前端 401 自动刷新 token 并重试原请求，避免使用中被踢到登录页
status: complete
date: 2026-08-09
mode: quick
---

# Quick Task 260809-q0t: 滑动续期（sliding token refresh）

## 概览

实现滑动续期：refresh token 存 DB（SHA-256 哈希、可吊销、滑动窗口），access token 缩短至 2h；
前端 401 自动单飞刷新并重试原请求一次，仅当刷新本身失败才跳登录页。4 个任务全部完成，4 个原子提交。

## 变更（按任务）

### 任务 01 — DB schema（commit `b53af8f`）
- `backend/sql/schema.sql` 追加 `refresh_tokens` 建表 DDL（`CREATE TABLE IF NOT EXISTS`，幂等）。
- 已用 `mysql -uroot -p123456 < backend/sql/schema.sql` 重放应用到运行中 MySQL（localhost:3306, db `tauri_mark`）。
- `SHOW TABLES LIKE 'refresh_tokens'` 命中；`DESC refresh_tokens` 字段与 DDL 一致。

### 任务 02 — 后端 refresh token 机制（commit `9892452`）
- `application.yml`：`jwt.expiration` 86400000 → **7200000（2h）**；新增 `jwt.refresh-expiration: 604800000`（7d，滑动窗口）。
- 新增 `entity/RefreshToken.java`、`mapper/RefreshTokenMapper.java`、`service/RefreshTokenService.java`：
  - RefreshTokenService 用 `SecureRandom` 生成 32 字节随机 hex 明文 token，DB 只存 `SHA-256(明文)` 哈希；`expiresAt = now + refreshExpiration`。
  - Mapper：insert / findByTokenHash / revokeById / revokeByTokenHash / revokeAllByUserId。
- `dto/AuthResponse.java` 增加 `refreshToken` 字段 + 4 参构造（Jackson SNAKE_CASE → JSON `refresh_token`）。
- 新增 `dto/RefreshRequest.java`。
- `AuthService`：login/register 签发 refresh token；新增 `refresh()`（校验 → 旋转作废旧 token → 发新 access + 新 refresh）；`revokeRefreshToken()`；`changePassword` 末尾 `revokeAllForUser`。
- `AuthController`：新增 `POST /api/auth/refresh`（失败返回 **401** 作为前端登出信号）；`logout` 改为可携带 `refresh_token` 吊销（不传 body 仍 200，向后兼容）。
- 未改 `SecurityConfig`（`/api/auth/**` 已 permitAll）。

### 任务 03 — 前端滑动刷新（commit `6aa64d3`）
- `src/axios/client.ts`：`REFRESH_TOKEN_KEY`、模块级 `refreshPromise` 单飞；`doRefresh()` 调 `/api/auth/refresh` 并更新本地 token；`clearAuthAndRedirect()`；响应拦截器对 401/403 受保护接口自动刷新并重试一次，`/api/auth/login|register|refresh|logout` 自身 401 不触发刷新（防死循环），刷新失败才跳 /login；成功分支返回结构不变。
- `src/api/type/auth.ts`：`AuthResponse` 增加 `refreshToken`，新增 `RefreshRequest{ refresh_token }`。
- `src/api/auth.ts`：新增 `refresh()`；`logout(data?)` 可传 refresh_token。
- `src/stores/auth.ts`：login/register 持久化 `auth_refresh_token`（`readRefreshToken` 兼容 snake_case/camelCase）；`logout()` 携带 refresh_token 通知后端吊销并清除本地凭据；`validateToken()` 保持不变（401 经拦截器自动刷新兜底）。

### 任务 04 — 集成验证 + 修复（commit `23bc499`）
- 验证中发现并修复：项目未启用 MyBatis 全局 `map-underscore-to-camel-case`，`findByTokenHash` 的 `SELECT *` 无法把 `expires_at`/`token_hash` 等映射到实体 camelCase 字段，`getExpiresAt()` 为 null 导致 `/refresh` 抛异常。按项目既有约定（仿 `MemoMapper` 的 `@Results` 写法）显式声明列映射。

## 验证结果

| 项 | 结果 |
|----|------|
| `cd backend && mvn -q -DskipTests compile` | ✅ 通过（EXIT=0，本机 Maven 3.9.14 / Java 26） |
| `npm run build`（vue-tsc --noEmit + vite build） | ✅ 通过（EXIT=0，1826 modules） |
| DB 迁移应用 + `SHOW TABLES LIKE 'refresh_tokens'` / `DESC` | ✅ 已应用并核对一致 |
| curl/Node 冒烟（对 8081 端口的全新后端实例） | ✅ 全部通过 |
| `npm run tauri dev` 手动验收（第 202~208 行的 7 项用例） | ⏳ 需人工执行（本环境仅验证到接口层；依赖前端 dev 运行时与浏览器） |

**接口层冒烟（已在运行中后端实测通过）：**
- `POST /api/auth/login`（新注册用户 `q0t_smoke_test`，密码为前端 SHA-256 哈希）→ 200，`data` 含 `token / refresh_token / username / user_id`。
- `GET /api/auth/current`（带 access token）→ 200。
- `POST /api/auth/refresh`（带 refresh_token）→ 200 返回新 pair，且**新 refresh_token ≠ 旧值**（旋转）。
- 用**旧 refresh_token** 再 refresh → **401**（已旋转作废）。
- 新 refresh_token 可继续 refresh（连续滑动两次均通过）。
- `POST /api/auth/logout`（带 refresh_token）→ 200；再用该 token refresh → **401**（已吊销）。
- `POST /api/auth/logout`（不传 body）→ 200（向后兼容）。
- `POST /api/auth/refresh`（garbage token）→ **401**。
- `POST /api/auth/change-password` → 200；改密前签发的 refresh_token 再 refresh → **401**（全端吊销）。

**需人工执行：**
1. `npm run tauri dev` 手动验收（计划第 202~208 行 7 项，覆盖「使用中不被踢」「真正过期才登出」「退出/改密吊销」「自动登录仍正常」等）。后端已在 8080 有运行实例（旧代码），需重启后端加载新代码后再测。
2. 已知可接受现象：改部署前已登录、仅存 `auth_token` 的旧会话，其 24h access token 过期后因无 refresh token 会退回登录页一次（新登录后正常）。

## 提交

| 任务 | Commit |
|------|--------|
| 任务 01 DB schema | `b53af8f` |
| 任务 02 后端机制 | `9892452` |
| 任务 03 前端滑动刷新 | `6aa64d3` |
| 任务 04 集成验证 + mapper 修复 | `23bc499` |

## 备注
- 验证用的临时后端跑在 8081 端口（8080 被用户既有旧代码实例占用，未触碰）；测试用户 `q0t_smoke_test` 及其 refresh_tokens/memo 数据已清理。
- 文档工件（PLAN/SUMMARY/STATE）未提交，由编排器统一处理。
