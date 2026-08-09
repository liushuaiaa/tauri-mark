# Requirements: Tauri Mark

**Defined:** 2026-08-09
**Core Value:** 记录和检索个人备忘录数据不丢失、不泄露（登录认证 + 可选加密）

## v1 Requirements

当前待构建范围：退出登录能力。其余已有能力记录于 `.planning/PROJECT.md`（Validated）。

### Authentication

- [ ] **AUTH-04**: 用户可在任意页面点击退出登录，退出后清除本地凭据并回到登录页
- [ ] **AUTH-05**: 后端提供退出登录接口，前端调用后使当前 token 失效（JWT 无状态下至少支持前端清除 + 可选的 token 黑名单）

## v2 Requirements

### 增强

- **AUTH-06**: 用户可修改密码
- **SYNC-01**: 多设备数据同步
- **AUTH-07**: 支持第三方登录（OAuth）

## Out of Scope

| Feature | Reason |
|---------|--------|
| 多端实时协同编辑 | 个人单机工具，无协同需求 |
| OAuth 第三方登录 | 个人使用，用户名密码足够 |
| 富文本图片外链存储 | 本地存储足够，避免额外复杂度 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 2 total
- Mapped to phases: 2
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-09*
*Last updated: 2026-08-09 after initial definition*
