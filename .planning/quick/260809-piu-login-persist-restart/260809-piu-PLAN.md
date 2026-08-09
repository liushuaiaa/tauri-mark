---
quick_id: 260809-piu
slug: login-persist-restart
description: 保留自动登录，但启动时校验 token（无效/过期则退回登录页）
status: planned
date: 2026-08-09
mode: quick
---

# Quick Task 260809-piu: 启动时校验 token，保留自动登录

## 背景与根因

**期望行为（用户确认）：** 保留自动登录（token 持久化在 localStorage），但每次启动先向后端校验 token——有效则进主界面，无效/过期则退回登录页。

**根因（已核实）：** `src/main.ts` 第 15 行 `app.use(router)` 会立刻触发 Vue Router 4 的首次初始导航；第 20-22 行 `validateToken().then(() => app.mount('#app'))` 在校验完成后才挂载。首次导航时，`src/router/index.ts` 守卫读到的是 `src/stores/auth.ts` 第 25 行乐观初始化的 `isLoggedIn`（只要 localStorage 有 token 就为 true），所以即使 token 已失效，首次导航到 `/` 也直接通过守卫；随后 `validateToken()` 校验失败清除了状态，但路由早已解析为 `/`，界面仍显示主界面。后端 `/api/auth/current` 本身对无效 token 正确返回 401（`JwtAuthenticationFilter.java`），问题只在前端没有用校验结果门控首次导航。

**矛盾机制：** `src-tauri/src/lib.rs` 第 33-38 行在窗口 `CloseRequested` 时 emit `clear-auth`，`src/App.vue` 第 217-222 行监听并调用 `logout()` 清除 token——这是旧「每次启动都要重新登录」设计，且 webview 销毁前不保证送达。与「保留自动登录」冲突，必须移除。

**不改动范围：**
- 后端 JWT 校验逻辑（已正确工作）。
- `src/router/index.ts` 守卫、`src/stores/auth.ts` 校验/登录逻辑——问题在于首次导航的时机，而非守卫本身。
- `src/axios/client.ts` 的 401/403 拦截器（失效 token 触发 `window.location.href = '/login'`，属既有行为，最终状态同样是登录页，改动有回归风险）。
- 显式「退出登录」按钮流程（独立且正常，依赖 `stores/auth.ts` 的 `logout()`，本次不触碰）。

## 任务 01：先校验 token 再执行首次路由导航

**文件：** `src/main.ts`

**动作：**
- 将 `app.use(router)`（第 15 行）移入 `validateToken().then(() => { ... })` 回调内，与 `app.mount('#app')` 放一起，确保路由首次初始导航（由 router 安装触发）只在 `validateToken()` 解析完成后才发生。此时 `isLoggedIn` 反映的是校验后的真实状态：
  - token 有效 → `isLoggedIn=true` → 初始导航 `/` 通过守卫 → 主界面。
  - token 无效/过期 → `validateToken()` 已清除凭据（`stores/auth.ts` 第 60-63 行）→ `isLoggedIn=false` → 守卫重定向 `/login`。
  - 无 token → `validateToken()` 提前返回 false → 登录页。
- `app.use(createPinia())`、`app.use(ElementPlus, ...)`、`app.component('CommonDialog', ...)` 保持顶层（不触发导航）。
- 修改后的 `main.ts` 结构形如：
  ```ts
  const app = createApp(App)
  app.use(createPinia())
  app.use(ElementPlus, { locale: zhCn })
  app.component('CommonDialog', CommonDialog)

  // 启动时先验证 token 有效性，再安装路由（初始导航）并挂载
  validateToken().then(() => {
    app.use(router)
    app.mount('#app')
  })
  ```
- 不要改 `src/axios/client.ts` 拦截器、`src/router/index.ts`、`src/stores/auth.ts`。

**验证：** `npm run build` 通过（含 `vue-tsc --noEmit` 类型检查与 `vite build`）。

**完成：** 应用启动时首次路由导航仅在 `validateToken()` 解析后才执行；无效/过期 token 不进入主界面，直接显示登录页。

## 任务 02：移除关闭窗口清 token 的 clear-auth 机制（保留自动登录）

**文件：** `src-tauri/src/lib.rs`、`src/App.vue`

**动作：**
- `src-tauri/src/lib.rs`：
  - 删除 `.setup(|app| { ... })` 回调块（第 30-39 行，含 `WindowEvent::CloseRequested` 时 `emit("clear-auth")`）。
  - 删除因此不再使用的第 2 行 `use tauri::{Manager, Emitter};`（`Manager`/`Emitter` 仅被该 setup 块使用）。Builder 链变为 `.plugin(...).plugin(...).invoke_handler(...).run(...)`。
- `src/App.vue`：
  - 删除 `onMounted` 中的 `listen('clear-auth', () => { logout() })` 块（第 217-222 行）。
  - 删除 `let unlistenClose: (() => void) | null = null`（第 66 行）及 `onUnmounted` 中的 `if (unlistenClose) { unlistenClose() }`（第 231-233 行）。
  - 删除因此不再使用的 import：第 37 行 `import { listen } from '@tauri-apps/api/event'` 与第 35 行 `import { logout } from './stores/auth'`（App.vue 中 `logout` 仅被该监听器使用）。注意：`src/views/home/editor.vue` 的 `listen` 用于拖拽事件，保持不动。
- 不动 `stores/auth.ts` 的 `logout()` 与各视图的显式退出按钮——只移除关闭窗口时的自动登出，让 token 跨重启持久化。

**验证：**
- `grep -rn "clear-auth" src src-tauri` 无任何匹配。
- `cd src-tauri && cargo check` 通过（确认删除 setup 与 import 后无未使用/未定义告警错误）。
- `npm run build` 通过。

**完成：** 关闭应用不再清除凭据，token 在 localStorage 中跨重启持久化；代码库中不再存在 `clear-auth` 引用；无残留未使用 import。

## 验收（手动功能验证）

运行 `npm run tauri dev`（需后端 `localhost:8080` 已启动）：

1. **有效 token 自动登录：** 正常登录后关闭再重新打开程序 → 直接进入主界面，不再显示登录页。
2. **无 token 进登录页：** 清空 localStorage（开发者工具 Application → Local Storage 删除 `auth_token`）后重启 → 显示登录页。
3. **无效/过期 token 进登录页：** 把 `auth_token` 改为伪造值（如 `invalid-token-xxx`）后重启 → 显示登录页，**不**进入主界面。
4. 显式「退出登录」按钮仍正常：点击后清除凭据并回到登录页。

## 变更文件

- `src/main.ts`
- `src-tauri/src/lib.rs`
- `src/App.vue`
