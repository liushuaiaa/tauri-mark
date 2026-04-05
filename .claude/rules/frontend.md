---
paths:
  - "src/**/*.vue"
  - "src/**/*.ts"
---

# 前端规范

## 项目结构
```
src/
  api/              # 接口层 (class 方式)
  axios/            # axios 封装
  stores/           # Pinia 状态管理
  views/            # 页面组件（按功能分文件夹）
  components/       # 公共组件
  styles/           # CSS 变量和全局样式
  router/           # 路由配置
```

## Vue 文件结构顺序
1. `<template>` - 模板
2. `<script setup lang="ts">` - 逻辑
3. `<style scoped>` - 样式

## 组件规范
- 公共组件放 `src/components/`
- 页面组件放 `src/views/`
- 组件内样式使用 `<style scoped>`

## 公共组件优先
**写页面之前必须先检查 `src/components/` 是否有可复用组件：**
1. 有相同功能的组件 → 必须使用公共组件
2. 无可复用组件 → 再考虑新建组件或页面
3. 多个页面有相同功能 → 应提取为公共组件

## 弹窗抽离规则
**页面中的弹窗必须抽离为独立 Vue 文件：**
- 所有弹窗均需抽离为独立组件，放在 `src/views/xxx/common/` 目录
- 弹窗命名以 `Dialog` 结尾
- 使用 `v-model` 控制显示，`defineEmits` 暴露确认事件

## v-for 循环优化
**重复的模板结构应使用 v-for 循环：**
- 导航菜单项（如 AppSidebar）
- 列表卡片操作按钮
- 相同布局的多个元素
- 定义数据数组，用 `markRaw()` 处理 icon 组件

## 文件放置规则

### 页面模块化
```
views/模块名/
  index.vue           # 模块主页（与文件夹同名）
  xxx.vue             # 模块内其他页面
  common/             # 模块内专属组件/弹窗
    XxxDialog.vue     # 弹窗（命名以Dialog结尾）
    XxxComponent.vue  # 其他组件
```

### 文件夹命名规则
| 类型 | 规则 | 示例 |
|------|------|------|
| 页面文件夹 | 与路由路径对应 | `home/`, `calendar/`, `trash/` |
| 主页文件 | `index.vue` | `views/home/index.vue` |
| 子页面 | 简短英文命名 | `editor.vue`, `day.vue`, `week.vue` |
| 模块内组件 | `common/` 目录 | `views/home/common/` |
| 弹窗 | 以 `Dialog` 结尾 | `ImportDialog.vue`, `PasswordDialog.vue` |

### 组件归属
- **全局组件** → `src/components/`
- **模块专属组件/弹窗** → `src/views/xxx/common/`

## API 调用
- 使用 `src/api/` 下的 class 方式接口
- 使用 Pinia store 管理状态和接口调用
- 不要在组件内直接调用 `api` 或 `request`

## 样式规范
- CSS 变量定义在 `src/styles/variables.css`
- 全局样式在 `src/styles/global.css`
- 组件特有样式在 `<style scoped>` 中

## TypeScript 规范
- 使用 `interface` 定义类型
- 使用 `type` 定义联合类型、枚举等
- 使用 `import type` 导入纯类型
- 接口参数类型抽到 `type/` 目录
