---
quick_id: 260809-ft4
slug: change-password
status: complete
date: 2026-08-09
---

# Quick Task 260809-ft4: 修改密码页 + 用户信息可点击 + 移除设置页退出

## 摘要

删除设置页「账号」退出按钮；顶部下拉第一行用户信息改为可点击，点击进入新「修改密码」页面（整页无左侧边栏，同 editor/day 模式）；后端新增 `POST /api/auth/change-password` 接口。

## 变更内容（按文件）

### 后端
- `dto/ChangePasswordRequest.java`（新建）：`oldPassword` / `newPassword`；Jackson 全局 SNAKE_CASE → 请求体 `old_password` / `new_password`
- `mapper/UserMapper.java`：新增 `updatePassword(id, password)`
- `service/AuthService.java`：新增 `changePassword(userId, oldPassword, newPassword)`，校验原密码后更新
- `controller/AuthController.java`：新增 `POST /change-password`，从 SecurityContext 取 userId（JWT 过滤器带 token 时填充），异常 400 / 未登录 401

### 前端
- `api/type/auth.ts`：新增 `ChangePasswordRequest { old_password, new_password }`
- `api/auth.ts`：`AuthApi` 新增 `changePassword`
- `views/user/change-password.vue`（新建）：原密码 / 新密码 / 确认新密码表单，CryptoJS SHA-256 哈希后提交，成功提示并跳回首页
- `router/index.ts`：新增路由 `/user/password`（name `change-password`，受登录守卫保护）
- `App.vue`：`showSidebar` 排除 `change-password`，该页不显示左侧边栏
- `components/TitleBar.vue`：下拉第一行用户信息改为 `el-dropdown-item command="profile"`，点击 `router.push('/user/password')`
- `views/settings/index.vue`：删除「账号」退出登录 section，移除未用的 `logout` / `ElMessageBox` import

## 验证

- `npx vue-tsc --noEmit` — 通过（exit 0）
- `mvn -q compile`（backend）— 通过（exit 0）
- 验收对照：
  - 设置页无退出按钮：已删除
  - 顶部下拉用户信息可点击 → 进入修改密码页：已实现
  - 修改密码页无左侧边栏：`App.vue` 排除路由
  - 修改密码成功后新密码生效：后端校验原密码并更新 sys_user.password

## 偏差

- 无代码实现偏差。
- 说明：`mvn compile` 重新生成了 `backend/target/classes/*.class` 编译产物（仓库中已跟踪），按「仅提交源码」约束不纳入提交，工作区保留这些修改。

## 提交

- `*` feat: 新增修改密码页面并支持修改密码接口
