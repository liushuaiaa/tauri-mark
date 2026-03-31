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
- **Vue Router** (`src/router/index.ts`) 四个路由：
  - `/` → `MemoList.vue`（卡片列表视图，按创建时间排序）
  - `/calendar` → `CalendarPage.vue`（自定义日历视图）
  - `/day` → `DayMemos.vue`（日期备忘录视图，显示当天所有内容）
  - `/editor/:id?` → `MemoEditor.vue`（创建/编辑，使用 Quill 富文本编辑器）
- UI 组件库为 **Element Plus**，富文本编辑为 **@vueup/vue-quill**
- 自定义光标 (`App.vue`) 使用 Canvas 动画实现跟随鼠标的星星粒子效果
- 公共弹窗组件 (`CommonDialog.vue`) 已注册为全局组件

### 组件列表 (src/components/)
| 组件 | 说明 |
|------|------|
| `CommonDialog.vue` | 公共弹窗组件（全局注册），固定居中，内容滚动，标题居中，关闭按钮靠右 |
| `CustomCalendar.vue` | 自定义日历组件，支持点击日期跳转，备忘录图标标记 |
| `AppSidebar.vue` | 侧边栏导航 |
| `TitleBar.vue` | 自定义标题栏 |

### 视图组件 (src/views/)
| 组件 | 说明 |
|------|------|
| `MemoList.vue` | 备忘录列表，支持图片预览 |
| `MemoEditor.vue` | 编辑器，支持图片插入（点击/拖拽）、txt/md 导入 |
| `CalendarPage.vue` | 日历页面 |
| `DayMemos.vue` | 日期备忘录页面，显示当天所有内容 |
| `ImportDialog.vue` | 导入弹窗（位于 views 目录） |

### 样式管理 (src/styles/)
公共样式集中在 `src/styles/` 目录统一管理：
- `variables.css` - CSS 变量（颜色、主题等）
- `global.css` - 全局样式（CSS reset、字体、Element Plus 主题覆盖、页面过渡动画）

组件特有的样式保留在各自 `.vue` 文件的 `<style scoped>` 中。

### 后端 (src-tauri/)
- **Rust/Tauri v2** + `serde` JSON 序列化
- 所有 Tauri 命令在 `src-tauri/src/lib.rs`：
  - `get_memos` - 从应用数据目录读取 `memos.json`
  - `save_memo` - 创建或更新备忘录（按 id upsert）
  - `delete_memo` - 按 id 删除备忘录
  - `read_file_as_base64` - 读取文件并转为 base64（用于图片插入）
  - `read_text_file` - 读取文本文件（用于导入 txt/md）
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

## 代码规范

### Vue 文件结构
所有 `.vue` 文件必须遵循以下结构顺序：
1. `<template>` - 模板部分，放在最上面
2. `<script setup lang="ts">` - 逻辑部分，放在中间
3. `<style scoped>` - 样式部分，放在最下面

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 逻辑代码
</script>

<style scoped>
/* 样式代码 */
</style>
```

## 常见问题

### 富文本编辑器图片插入
编辑器支持两种图片插入方式：
- **点击插入**：点击工具栏图片按钮选择本地图片
- **拖拽插入**：直接将图片文件拖入编辑器区域（Tauri 桌面应用使用原生拖拽事件）

图片以 base64 形式嵌入内容，保存后仍可正常显示。

### 日历日期点击规则
- 未来日期：可点击，跳转到日期备忘录页面
- 今天及过去日期：不可点击
- 有备忘录的日期：可点击，图标标记在右上角

### 公共弹窗组件 (CommonDialog)
已在 `main.ts` 中注册为全局组件，使用方式：
```vue
<CommonDialog v-model="visible" title="标题" width="600px">
  <!-- 内容 -->
  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <el-button type="primary">确认</el-button>
  </template>
</CommonDialog>
```

特性：
- 弹窗固定在页面正中央
- 内容区域可滚动（最大高度 60vh）
- 点击遮罩层不关闭（`:close-on-click-modal="false"`）
- 自定义关闭按钮（X）

### Element Plus 日期组件类型
`ElDatePicker` 的 `v-model` 类型应使用 `[Date, Date] | null`，不要使用 `DateModelType`：
```typescript
const dateRange = ref<[Date, Date] | null>(null)
```

### Tauri v2 窗口权限
自定义窗口控件（关闭、最小化、最大化、拖动）需要在 `src-tauri/capabilities/default.json` 中添加权限：
- `core:window:allow-close`
- `core:window:allow-minimize`
- `core:window:allow-maximize`
- `core:window:allow-start-dragging`

### 自定义光标效果状态持久化
使用 `localStorage` + Vue `ref` + `watch` 实现：
```typescript
import { ref, watch } from 'vue'
const STORAGE_KEY = 'cursor-effect-enabled'
function getInitialValue(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return JSON.parse(stored)
  } catch {}
  return true
}
export const cursorEnabled = ref(getInitialValue())
watch(cursorEnabled, (newVal) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  } catch {}
})
```

### 自定义光标切换
- 隐藏原生光标：给 `body` 添加 `cursor-hidden` class
- 切换粒子效果显示：使用 CSS `display: none/block`，不要用 `v-if`（避免 DOM 重建导致动画丢失）
- 重新启用时需要重新初始化粒子效果元素
