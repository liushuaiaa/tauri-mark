---
quick_id: 260809-ft1
slug: gsd-claude-rules
status: complete
date: 2026-08-09
---

# Quick Task 260809-ft1: 当前项目 GSD 遵循 .claude/rules

## 摘要

用户要求**当前项目**运行 GSD 指令时遵循项目 `.claude/rules/` 规则，并明确**不改动全局系统文件**。采用项目本地机制：GSD 所有工作流都会把 `./CLAUDE.md` 传给子代理，因此在项目 `CLAUDE.md` 中加入强制指令即可让所有 GSD 子代理读取 `.claude/rules/`。此前误改的 `~/.claude/get-shit-done/` 全局文件（project-skills-discovery.md、quick.md、execute-phase.md）经确认均已还原为原始内容，无需回滚。

## 变更内容（按文件）

### `d:\xn-project\tauri-mark\CLAUDE.md`
- 「代码规范」小节追加强制要求：GSD 子代理（planner / executor / reviewer / verifier 等）执行任务时，必须**首先**读取并遵循 `.claude/rules/` 下**所有** `.md` 规则文件（api.md / frontend.md / components.md），声明其为项目级约定、优先级高于 GSD 通用默认值，规划/实现/校验阶段不得跳过。

### `~/.claude/get-shit-done/` 全局文件
- **未改动**。曾做的全局编辑（project-skills-discovery.md 发现步骤、quick.md 两处内联提示、execute-phase.md files_to_read）当前均已不存在（已还原为原始内容），不涉及回滚操作。

## 验证

- `CLAUDE.md` 更新后，GSD 工作流（quick.md / plan-phase.md / execute-phase.md）的 `<files_to_read>` 均包含 `./CLAUDE.md (Project instructions...)`，子代理会读取 CLAUDE.md 并遵循其中的强制指令 → 机制链路完整。
- `git status`：仅 CLAUDE.md 与 .planning 文档为待提交改动，无其他残留。

## 偏差

- 原计划（260809-ft1 第一版）拟修改 GSD 全局工作流文件以覆盖所有项目；用户指出应仅在当前项目内生效、不动系统文件，已改为项目本地方案（CLAUDE.md 指令）。全局文件改动未落地，无需撤销。

## 提交

- `*` 更新 CLAUDE.md 要求 GSD 子代理遵循 .claude/rules
