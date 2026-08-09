# Tauri Mark — 桌面备忘录

## What This Is

个人桌面备忘录应用：Tauri v2 + Vue 3 + TypeScript 前端，Spring Boot + MySQL 后端。支持登录/注册、备忘录增删改查、日历视图、回收站、天气关联、备忘录加密（密码提示）、自定义星星光标、可折叠侧边栏。以本地桌面体验为主，后端提供远程 API 存储。

## Core Value

记录和检索个人备忘录数据不丢失、不泄露（登录认证 + 可选加密），并快速完成记录/编辑/检索流程。

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

- ✓ 用户注册/登录（前端 SHA-256 密码哈希 + JWT 无状态认证）— 已有
- ✓ 备忘录增删改查（列表/分页/详情）— 已有
- ✓ 回收站（软删除/恢复/清空/定时清理）— 已有
- ✓ 日历视图（月视图 + 日期备忘录 + 周总结）— 已有
- ✓ 备忘录加密与密码提示 — 已有
- ✓ 天气关联（图标 + 温度）— 已有
- ✓ 自定义星星光标、可折叠侧边栏、自定义标题栏 — 已有

### Active

<!-- Current scope. Building toward these. -->

- [ ] AUTH-04: 用户可以在任意页面退出登录，退出后清空本地凭据并回到登录页
- [ ] AUTH-05: 后端提供安全的退出登录接口（使当前 token 失效或支持前端清除）

### Out of Scope

<!-- Explicit boundaries. Includes reasoning. -->

- 多端实时同步 — 个人单机工具，无协同需求
- 第三方登录（OAuth） — 个人使用，用户名密码足够
- 富文本图片外链存储 — 本地存储足够，避免额外复杂度

## Context

- 前端：Vue 3 + Pinia + Element Plus + Quill（编辑器），axios 封装 `request`，`src/api/` class 方式接口层
- 后端：Spring Boot 3.2 + MyBatis（注解 SQL）+ MySQL 8 + JWT（jjwt 0.12.3），全局 Jackson `SNAKE_CASE` 命名策略
- 认证：前端用 CryptoJS SHA-256 哈希密码后发送，后端直接比对；`/api/auth/**` 放行，其余接口需 Bearer token
- 登录状态存储于 localStorage（`auth_token` / `auth_username` / `auth_userid`），关闭程序时清除 token（已有行为）
- 已知问题：application.yml 数据库密码已修正为 `123456`；`/api/auth/login|register` 捕获所有异常并返回 400（message 可能为 null）

## Constraints

- **Tech stack**: Tauri v2 + Vue 3 + TS 前端、Spring Boot 3.2 + MySQL 8 后端 — 项目既有技术栈
- **Compatibility**: 后端需 JDK 17+、MySQL 8.0+、Maven 3.6+；前端 Node + npm
- **Security**: 密码在传输前 SHA-256 哈希；JWT 无状态；前端敏感信息存 localStorage
- **Network**: 本机需代理访问 GitHub（git 已配置 http.proxy 127.0.0.1:7897）

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| JWT 无状态认证 | 前后端分离，无 session 服务器 | — Pending |
| 前端 SHA-256 密码哈希后传输 | 避免明文密码过网 | — Pending |
| 全局 Jackson SNAKE_CASE 命名 | 与数据库 snake_case 列、前端接口对齐 | — Pending |
| 数据库密码 123456（非 root） | 本机 MySQL 实际密码 | ✓ Good |
| 退出登录走前端清除 token + 后端接口 | 待实现 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-09 after initialization*
