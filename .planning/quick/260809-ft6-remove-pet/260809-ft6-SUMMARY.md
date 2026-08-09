---
quick_id: 260809-ft6
slug: remove-pet
status: complete
date: 2026-08-09
---

# Quick Task 260809-ft6: 去除宠物部分

## 摘要

移除应用中「宠物」功能：侧边栏导航入口、路由、宠物页面。宠物页为占位页（`<div>1</div>`），无后端引用，删除干净。

## 变更内容（按文件）

### `src/components/AppSidebar.vue`
- 删除 `navItems` 中 `{ path: '/pet', name: '宠物', icon: markRaw(Grid) }`
- 删除 `routeTitleMap` 中 `'/pet': '宠物'`
- 删除 `Grid` icon 导入

### `src/router/index.ts`
- 删除 `import PetPage from '../views/pet/index.vue'`
- 删除 `/pet` 路由（path `/pet`，name `pet`）

### `src/views/pet/`
- 整个目录删除（含占位页 `index.vue`）

## 验证

- `npx vue-tsc --noEmit` — 通过（exit 0）
- 验收对照：
  - 侧边栏不再显示「宠物」：已实现
  - `/pet` 路由移除：已实现
  - 宠物页目录删除：已实现
  - src 下无 `宠物` / `/pet` / `PetPage` / `Grid` 残留：已确认

## 偏差

无。

## 提交

- `feat: 去除宠物功能（侧边栏入口、路由、页面）`
