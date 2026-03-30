# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Tauri v2 + Vue 3 + TypeScript 的桌面备忘录应用。数据存储在应用数据目录的 `memos.json` 文件中。应用包含自定义星星光标效果、可折叠侧边栏导航和日历视图。

## 常用命令

```bash
npm run dev          # 运行前端开发服务器 (Vite)
npm run build        # 构建前端（带类型检查 vue-tsc）
npm run preview      # 预览构建后的前端
npm run tauri dev    # 以开发模式运行完整 Tauri 应用
npm run tauri build  # 构建 Tauri 应用发布版
```

## 架构

### 前端 (src/)
- **Vue 3** + `<script setup>` 单文件组件 + Composition API
- **Pinia** store (`src/stores/memo.ts`) - 管理所有备忘录状态及 Tauri 调用
- **Vue Router** (`src/router/index.ts`) 三个路由：
  - `/` → `MemoList.vue`（卡片列表视图）
  - `/calendar` → `CalendarPage.vue`（完整日历视图，使用 v-calendar）
  - `/editor/:id?` → `MemoEditor.vue`（创建/编辑，使用 Quill 富文本编辑器）
- UI 组件库为 **Element Plus**，日历组件为 **v-calendar**，富文本编辑为 **@vueup/vue-quill**
- 自定义光标 (`App.vue`) 使用 Canvas 动画实现跟随鼠标的星星粒子效果

### 后端 (src-tauri/)
- **Rust/Tauri v2** + `serde` JSON 序列化
- 所有 Tauri 命令在 `src-tauri/src/lib.rs`：
  - `get_memos` - 从应用数据目录读取 `memos.json`
  - `save_memo` - 创建或更新备忘录（按 id  upsert）
  - `delete_memo` - 按 id 删除备忘录
- 数据路径：`{app_data_dir}/memos.json`

### 备忘录数据模型
```typescript
interface Memo {
  id: string        // UUID
  title: string
  content: string   // Quill 编辑器输出的 HTML
  created_at: number // Unix 时间戳（毫秒）
  updated_at: number // Unix 时间戳（毫秒）
}
```
