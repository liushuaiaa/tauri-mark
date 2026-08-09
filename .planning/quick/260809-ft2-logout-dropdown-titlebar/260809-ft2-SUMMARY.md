---
quick_id: 260809-ft2
slug: logout-dropdown-titlebar
status: complete
date: 2026-08-09
---

# Quick Task 260809-ft2: 退出入口移到顶部下拉

## 摘要

侧边栏收起时退出按钮位于图标按钮上方很丑。将退出入口迁移到顶部标题栏「记事本」标题：登录态 hover「记事本」弹出下拉菜单，第一行显示当前用户信息（用户名），第二行显示「退出登录」；侧边栏（展开/收起）的退出按钮全部移除。

## 变更内容（按文件）

### `src/components/TitleBar.vue`
- 「记事本」标题在登录态包裹 `el-dropdown`（`trigger="hover"`），未登录（含登录页）保持纯标题
- 下拉内容：`.dropdown-user-info`（User 图标 + `currentUsername`）为第一行，`el-dropdown-item command="logout" divided`（SwitchButton 图标 + 退出登录）为第二行
- 新增 `handleUserCommand`：`logout` 命令 → store `logout()` → `ElMessage.success('已退出登录')` → `router.push('/login')`
- 新增 imports：`useRouter`、`isLoggedIn/currentUsername/logout`、`User`/`SwitchButton` 图标、`ElMessage`
- 新增样式：`.user-dropdown`（pointer 光标）、`.dropdown-user-info`、`.dropdown-username`（超长截断）

### `src/components/AppSidebar.vue`
- 移除展开态 header 的退出按钮（`logout-btn`）
- 移除折叠态 footer 的退出按钮（`footer-logout-btn`）
- 移除 `handleLogout`、未使用的 `router`/`useRouter`，以及 `SwitchButton`、`logout`、`ElMessage`、`ElMessageBox` imports
- 清理样式：`.logout-btn`、`.footer-logout-btn`、`.sidebar.collapsed .sidebar-footer` 列布局

## 验证

- `npx vue-tsc --noEmit` — 通过（exit 0）
- 验收对照：
  - 侧边栏展开/收起均无退出按钮：已移除
  - 顶部「记事本」hover 弹下拉，第一行用户名、第二行退出：已实现
  - 点退出 → 回登录页、本地凭据清除：`logout()` + 路由跳转，复用 store 逻辑
  - 登录页不显示下拉：`v-if="isLoggedIn"` 控制

## 偏差

- 无代码实现偏差，计划按原样执行。

## 提交

- `*` feat: 退出登录入口移到顶部标题栏 hover 下拉
