---
quick_id: 260809-ft3
slug: dropdown-outline
status: complete
date: 2026-08-09
---

# Quick Task 260809-ft3: 移除下拉触发器黑色描边

## 摘要

顶部「记事本」hover 打开下拉时出现黑色描边。根因：`el-dropdown` 内部可聚焦触发器（`span.title-text` 带 `role="button"` 和 `tabindex`，位于 `.el-tooltip__trigger` 下）被浏览器绘制默认 focus 环。第一次只屏蔽了 `.user-dropdown` 自身的 outline（选择器未命中内部元素），hover 进入/移出时描边仍闪现；补充修复改用 `:deep(*)` 屏蔽触发器子树所有元素的 outline 后彻底解决。

## 变更内容（按文件）

### `src/components/TitleBar.vue`
- 第一轮（a035829）：`.user-dropdown` 的 `:focus` / `:focus-visible` / `:focus-within` / `:hover` 设 `outline: none`
- 第二轮：新增 `.user-dropdown :deep(*) { outline: none !important; }`，覆盖 el-dropdown 内部可聚焦元素（`.el-tooltip__trigger` / `.title-text`）的浏览器默认 focus 环；`!important` 确保压过 UA 样式

## 验证

- `npx vue-tsc --noEmit` — 通过（exit 0）
- 预期效果：hover 进入、停留、移出「记事本」均无黑色描边

## 偏差

- 第一轮修复不完整（选择器未命中内部可聚焦元素），补充 `:deep(*)` 规则后完成。

## 提交

- `a035829` fix: 移除「记事本」下拉触发器 hover 时的黑色 focus 描边
- `*` fix: 屏蔽 el-dropdown 内部可聚焦触发器的浏览器默认 focus 环
