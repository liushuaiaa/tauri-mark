---
quick_id: 260809-ft3
slug: dropdown-outline
status: complete
date: 2026-08-09
---

# Quick Task 260809-ft3: 移除下拉触发器黑色描边

## 摘要

顶部「记事本」hover 打开下拉时，`el-dropdown` 触发器（focusable span）出现浏览器默认黑色 focus 描边。通过屏蔽 trigger 的 focus / focus-visible / focus-within / hover 描边解决。

## 变更内容（按文件）

### `src/components/TitleBar.vue`
- `.user-dropdown` 追加 `:focus`、`:focus-visible`、`:focus-within`、`:hover` 状态规则，统一设 `outline: none`

## 验证

- `npx vue-tsc --noEmit` — 通过（exit 0）
- 预期效果：hover「记事本」弹出下拉时不再显示黑色描边

## 偏差

- 无代码实现偏差，计划按原样执行。

## 提交

- `*` fix: 移除「记事本」下拉触发器 hover 时的黑色 focus 描边
