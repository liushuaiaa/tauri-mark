---
quick_id: 260809-piu
slug: login-persist-restart
description: 保留自动登录，但启动时校验 token（无效/过期则退回登录页）
status: complete
date: 2026-08-09
mode: quick
commits:
  - d376cd6  fix(260809-piu): 启动时先校验 token 再执行首次路由导航
  - e1e28ca  fix(260809-piu): 移除关闭窗口清 token 的 clear-auth 机制，保留自动登录
---

# Quick Task 260809-piu: 启动时校验 token，保留自动登录

## 目标

保留自动登录（token 持久化在 localStorage），但每次启动先向后端校验 token：有效则进主界面，无效/过期则退回登录页。

## 变更内容

### 任务 01：先校验 token 再执行首次路由导航（commit `d376cd6`）

文件：`src/main.ts`

将 `app.use(router)` 从顶层移入 `validateToken().then(() => { ... })` 回调内，与 `app.mount('#app')` 放在一起。路由首次初始导航（由 router 安装触发）只在 `validateToken()` 解析完成后才发生：

- token 有效 → `isLoggedIn=true` → 初始导航 `/` 通过守卫 → 主界面。
- token 无效/过期 → `validateToken()` 已清除凭据 → `isLoggedIn=false` → 守卫重定向 `/login`。
- 无 token → `validateToken()` 提前返回 false → 登录页。

`app.use(createPinia())`、`app.use(ElementPlus, ...)`、`app.component('CommonDialog', ...)` 保持顶层（不触发导航）。

### 任务 02：移除关闭窗口清 token 的 clear-auth 机制（commit `e1e28ca`）

- `src-tauri/src/lib.rs`：删除 `.setup()` 回调块（`WindowEvent::CloseRequested` 时 `emit("clear-auth")`），并删除因此不再使用的 `use tauri::{Manager, Emitter};`。
- `src/App.vue`：删除 `onMounted` 中 `listen('clear-auth', () => logout())` 块、`let unlistenClose` 变量、`onUnmounted` 中的 `unlistenClose()` 清理，以及不再使用的 `import { logout } from './stores/auth'` 和 `import { listen } from '@tauri-apps/api/event'`。

未触碰 `src/axios/client.ts`、`src/router/index.ts`、`src/stores/auth.ts`，后端 Java 代码未改动，显式「退出登录」按钮流程保持不变。

## 验证结果

- 任务 01：`npm run build`（`vue-tsc --noEmit` + `vite build`）通过。
- 任务 02：
  - `grep -rn "clear-auth" src src-tauri` 无任何匹配。
  - `cd src-tauri && cargo check` 通过（无未使用/未定义告警错误）。
  - `npm run build` 通过。

## 手动验收（需后端 `localhost:8080` 运行 `npm run tauri dev`）

1. 有效 token 自动登录：正常登录后关闭再重新打开 → 直接进入主界面。
2. 无 token 进登录页：清空 localStorage（删除 `auth_token`）后重启 → 显示登录页。
3. 无效/过期 token 进登录页：把 `auth_token` 改为伪造值后重启 → 显示登录页，不进入主界面。
4. 显式「退出登录」按钮仍正常：点击后清除凭据并回到登录页。

## 变更文件

- `src/main.ts`
- `src-tauri/src/lib.rs`
- `src/App.vue`
