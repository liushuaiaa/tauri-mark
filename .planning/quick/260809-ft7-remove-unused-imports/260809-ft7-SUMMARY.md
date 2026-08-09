---
quick_id: 260809-ft7
slug: remove-unused-imports
status: complete
date: 2026-08-09
---

# Quick Task 260809-ft7: 清理后端未使用 import

## 摘要

IDE 报告两个 unused import 警告，均已删除，`mvn compile` 通过。

## 变更内容（按文件）

### `backend/src/main/java/com/taurimark/controller/AuthController.java`
- 删除 `import java.util.Map`（全文件未使用）

### `backend/src/main/java/com/taurimark/config/SecurityConfig.java`
- 删除 `import com.taurimark.config.JwtAuthenticationFilter`（与 SecurityConfig 同包，同包导入冗余；JwtAuthenticationFilter 字段/构造器使用不受影响）

## 验证

- `mvn -q compile` — 通过（exit 0）
- 验收对照：
  - AuthController 无 unused import 警告：已实现
  - SecurityConfig 无 unused import 警告：已实现

## 偏差

无。

## 提交

- `chore: 移除后端未使用 import（AuthController、SecurityConfig）`
