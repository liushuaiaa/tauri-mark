---
quick_id: 260809-fnv
slug: add-logout
status: complete
date: 2026-08-09
---

# Quick Task 260809-fnv: 前后端实现退出登录

## 摘要

前后端同时补上退出登录：后端新增 `POST /api/auth/logout` 接口；前端 API 层新增 `logout` 方法，store 的 `logout()` 尽力调用后端后再清除本地凭据；UI 上设置页新增「退出登录」入口，折叠侧边栏 footer 也增加退出图标按钮，保证任何界面状态都能退出。

## 变更内容（按文件）

### 后端
- `backend/src/main/java/com/taurimark/controller/AuthController.java`
  - 新增 `@PostMapping("/logout")`，返回 `ResponseEntity.ok(ApiResponse.success())`。
  - 无状态 JWT 登出：接口仅返回成功，token 在 24h 有效期内仍可用属已知特性，不做 token 黑名单（列为未来增强）。

### 前端
- `src/api/auth.ts`
  - `AuthApi` 新增 `logout = () => request<void>({ method: 'POST', url: '/api/auth/logout' })`。
- `src/stores/auth.ts`
  - `logout()` 改为先尽力调用 `authApi.logout().catch(() => {})`（失败忽略、不阻塞），随后清除 `auth_token/auth_username/auth_userid` 并重置 `isLoggedIn`/`currentUsername`。
- `src/views/settings/index.vue`
  - 新增「账号」section：含「退出登录」按钮（`type="danger" plain`），确认框（`ElMessageBox.confirm`）→ 调用 `logout()` → `ElMessage.success('已退出登录')` → `router.push('/login')`。
- `src/components/AppSidebar.vue`
  - 保留展开态 header 的退出按钮；折叠态 footer 新增 `SwitchButton` 退出图标按钮（`v-if="sidebarCollapsed"`），并调整 `.sidebar-footer` 在折叠态为 `flex-direction: column` 布局，两个按钮均可容纳。

## 验证

- 前端类型检查：`npx vue-tsc --noEmit` — 通过（exit 0）。
- 后端编译：`mvn -q compile`（backend 目录）— 通过（exit 0）。
- 验收对照：
  - 后端 `POST /api/auth/logout` 返回 `{"code":200,"message":"success","data":null}`：接口已实现，`/api/auth/**` 在 SecurityConfig 中 permitAll，未登录也可调用成功。
  - 设置页可点「退出登录」，确认后回登录页：已实现。
  - 折叠侧边栏有退出入口：已实现（footer 图标按钮）。
  - 退出后本地凭据清除、`isLoggedIn` 置 false：store 逻辑已更新。

## 偏差

- 无代码实现偏差，计划按原样执行。
- 说明：验证期间 `mvn compile` 重新生成了 `backend/target/classes/*.class` 编译产物（仓库中已跟踪这些文件）。按「仅提交源码」约束，未将这些编译产物纳入提交，工作区保留这些修改。`.claude/settings.local.json` 与 `backend/src/main/resources/application.yml` 的修改为任务开始前已存在的无关改动，未触碰。

## 提交

- `e2e017f` feat: 后端添加退出登录接口
- `b2febd2` feat: 前端支持退出登录
