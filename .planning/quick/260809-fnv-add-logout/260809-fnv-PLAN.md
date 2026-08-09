---
quick_id: 260809-fnv
slug: add-logout
description: 突然发现当前程序没有退出账号的操作，请前后端一起加上
date: 2026-08-09
mode: quick
---

# Quick Task 260809-fnv: 前后端实现退出登录

## 背景

- 前端 `src/stores/auth.ts` 已有 `logout()`（清除 localStorage 凭据 + 重置状态），但**没有调用后端接口**。
- 侧边栏 `src/components/AppSidebar.vue` 已有退出按钮，但仅当侧边栏**展开**时显示（header `v-if="!sidebarCollapsed"`）；导航后侧边栏自动折叠，折叠后无任何退出入口 → 用户找不到退出操作。
- 后端**没有** logout 接口；`src/api/auth.ts` 的 `AuthApi` 没有 logout 方法。

## 实现方案

采用 JWT 无状态 logout：后端提供接口返回成功，前端清除本地凭据即完成登出（token 24h 内仍有效，属无状态 JWT 的已知特性；token 黑名单列为未来增强，不做）。这满足 AUTH-05「至少支持前端清除」。

### 任务 01-01：前后端实现退出登录

**后端**
- `backend/src/main/java/com/taurimark/controller/AuthController.java`：新增
  `@PostMapping("/logout")`，返回 `ResponseEntity.ok(ApiResponse.success())`（无需请求体；已登录用户携带 Bearer token 调用）。

**前端 API**
- `src/api/auth.ts`：`AuthApi` 新增 `logout = () => request<void>({ method: 'POST', url: '/api/auth/logout' })`。

**前端 Store**
- `src/stores/auth.ts`：`logout()` 改为先尽力调用 `authApi.logout()`（`try/catch` 忽略失败），随后清除 localStorage 凭据并重置状态；保持同步返回，不阻塞调用方。

**前端 UI（保证入口可见）**
- `src/views/settings/index.vue`：新增「账号」section，含「退出登录」按钮（确认框 → 调用 `logout()` → `ElMessage.success('已退出登录')` → `router.push('/login')`）。
- `src/components/AppSidebar.vue`：保留现有展开态退出按钮，并在**折叠态** footer 增加退出图标按钮（`SwitchButton`），保证任何状态都可退出。

## 验收

- [ ] 后端 `POST /api/auth/logout` 返回 `{"code":200,"message":...,"data":null}`
- [ ] 前端设置页可点击「退出登录」，确认后回到登录页
- [ ] 折叠侧边栏时也有退出入口
- [ ] 退出后本地 `auth_token/auth_username/auth_userid` 被清除，`isLoggedIn` 为 false

## 变更文件

- `backend/src/main/java/com/taurimark/controller/AuthController.java`
- `src/api/auth.ts`
- `src/stores/auth.ts`
- `src/views/settings/index.vue`
- `src/components/AppSidebar.vue`
