---
quick_id: 260809-ft5
slug: user-profile
status: complete
date: 2026-08-09
---

# Quick Task 260809-ft5: 个人信息页（基本信息 + 修改密码）

## 摘要

上一版修改密码页复用了登录页的「居中卡片 + 灰渐变」样式，用户误以为进入登录/注册页。本次重做为真正的应用内「个人信息」页面：展示用户基本信息（用户名、用户ID）+ 修改密码，样式与设置页一致（`#FAFAFA` 底 + 白色卡片），不复用登录页样式。页面继续不显示左侧边栏（不加入侧边栏导航），增加顶部「返回」按钮。

## 变更内容（按文件）

### `src/stores/auth.ts`
- 新增 `currentUserId` ref（从 localStorage `auth_userid` 初始化），logout 置 null
- 新增 `readUserId(data)` 兼容读取：后端 Jackson SNAKE_CASE 返回 `user_id`，原代码读 `response.data.userId` 为 undefined
- register / login / validateToken 同步 `currentUserId` 与 localStorage

### `src/views/user/index.vue`（新建，替换 change-password.vue）
- 页面标题「个人信息」+ 顶部「返回」按钮（→ `/`）
- 「基本信息」卡片：用户名（`currentUsername`）、用户ID（`currentUserId`）
- 「修改密码」卡片：原密码/新密码/确认新密码，CryptoJS SHA-256 哈希后提交，成功清空表单
- 样式与设置页一致（`.section-card` / `.info-item` / `label-position="top"` 表单）

### `src/router/index.ts`
- 路由改为 `/user`，name `profile`，组件 `views/user/index.vue`

### `src/App.vue`
- `showSidebar` 排除 `profile`（原 `change-password`），页面无左侧边栏

### `src/components/TitleBar.vue`
- 下拉 `profile` 命令跳转 `/user`（原 `/user/password`）

## 验证

- `npx vue-tsc --noEmit` — 通过（exit 0）
- 验收对照：
  - 点击顶部用户信息进入「个人信息」页，样式同设置页而非登录页：已实现
  - 展示用户名、用户ID（修复 user_id 读取）：已实现
  - 可修改密码，成功提示：已实现
  - 页面不在侧边栏导航、无侧边栏、有返回按钮：已实现

## 偏差

- 路由名由 `change-password` 调整为 `profile`，路径 `/user/password` → `/user`。

## 提交

- `*` feat: 修改密码页重做为「个人信息」页（基本信息 + 修改密码）
