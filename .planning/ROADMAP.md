# Roadmap: Tauri Mark

## Overview

Tauri Mark 桌面备忘录已具备核心能力：登录/注册、备忘录 CRUD、日历视图、回收站、备忘录加密、天气关联、自定义光标等（详见 PROJECT.md Validated）。当前从补齐"退出登录"能力开始，后续推进账号安全与多端能力增强。

## Phases

- [ ] **Phase 1: 退出登录** - 前后端协作的退出登录能力（当前活动范围）
- [ ] **Phase 2: 账号增强** - 修改密码等账号管理能力（v2 候选）
- [ ] **Phase 3: 多端同步** - 多设备数据同步（v2 候选）

## Phase Details

### Phase 1: 退出登录
**Goal**: 用户在任意页面可退出登录，清除本地凭据并回到登录页；后端提供退出登录接口
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. 用户点击"退出登录"后，本地 token/用户名/用户 ID 被清除，界面跳转到登录页
  2. 后端提供 `POST /api/auth/logout` 接口，已登录用户调用返回成功
  3. 退出后本地登录状态为未登录，后续请求不再携带旧 token
**Plans**: 1 plan

Plans:
- [ ] 01-01: 实现退出登录（前端入口 + 本地凭据清除 + 后端 logout 接口）

### Phase 2: 账号增强
**Goal**: 用户可修改密码等账号管理能力
**Depends on**: Phase 1
**Requirements**: AUTH-06
**Success Criteria** (what must be TRUE):
  1. 用户可在设置页修改自己的密码
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: 多端同步
**Goal**: 多设备数据同步
**Depends on**: Phase 2
**Requirements**: SYNC-01
**Success Criteria** (what must be TRUE):
  1. 用户在不同设备登录同一账号可看到一致的数据
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 退出登录 | 0/1 | Not started | - |
| 2. 账号增强 | 0/0 | Not started | - |
| 3. 多端同步 | 0/0 | Not started | - |
