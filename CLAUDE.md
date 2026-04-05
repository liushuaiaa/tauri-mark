# CLAUDE.md

Tauri v2 + Vue 3 + TypeScript 桌面备忘录应用，Spring Boot + MySQL 后端服务。

## 项目概述
- **前端**：Vue 3 + Pinia + Element Plus + Quill
- **后端**：Spring Boot + MyBatis + MySQL + JWT
- **特性**：自定义星星光标、可折叠侧边栏、日历视图

## 常用命令
```bash
npm run dev          # 前端开发服务器
npm run build        # 前端构建
npm run tauri dev    # Tauri 开发模式
npm run tauri build  # Tauri 发布版
```

## 前端目录
| 目录 | 说明 |
|------|------|
| `src/api/` | 接口层 (class 方式) |
| `src/axios/` | axios 封装，request + ApiResponse |
| `src/stores/` | Pinia 状态 (auth, cursor, memo, sidebar, trash, weather) |
| `src/router/` | Vue Router 配置 |
| `src/views/` | 页面组件 |
| `src/components/` | 公共组件 |
| `src/styles/` | CSS 变量和全局样式 |

### Store 列表
| 文件 | 说明 |
|------|------|
| `auth.ts` | 认证状态 |
| `cursor.ts` | 光标效果状态 |
| `memo.ts` | 备忘录状态 |
| `sidebar.ts` | 侧边栏状态 |
| `trash.ts` | 回收站状态 |
| `weather.ts` | 天气状态 |

### 视图组件
| 组件 | 说明 |
|------|------|
| `MemoList.vue` | 卡片列表 |
| `MemoEditor.vue` | 编辑器 (Quill) |
| `CalendarPage.vue` | 日历视图 |
| `DayMemos.vue` | 日期备忘录 |
| `LoginPage.vue` | 登录页 |
| `Settings.vue` | 设置页 |
| `TrashView.vue` | 回收站 |
| `WeekSummary.vue` | 周总结 |
| `ImportDialog.vue` | 导入弹窗 |

### 公共组件
| 组件 | 说明 |
|------|------|
| `CommonDialog.vue` | 全局弹窗，固定居中，内容滚动 |
| `CustomCalendar.vue` | 日历，支持日期跳转和备忘录图标 |
| `AppSidebar.vue` | 侧边栏导航 |
| `TitleBar.vue` | 自定义标题栏 |

### 后端包结构
controller / service / mapper / entity / dto / config

## 数据模型
```typescript
interface Memo {
  id: string; title: string; content: string;
  created_at: number; updated_at: number; deleted_at: number | null;
  encrypted: boolean; password_hint: string | null;
  weather_icon: string | null; weather_temp: number | null;
}
```

## API 路径

### 备忘录 `/api/memos`
- `GET /list` - 列表
- `GET /page` - 分页
- `GET /query/{id}` - 查询
- `POST /add` - 添加
- `PUT /edit` - 编辑
- `DELETE /delete/{id}` - 删除

### 回收站 `/api/memos/trash`
- `GET /trash` - 列表
- `POST /trash/{id}/restore` - 恢复
- `DELETE /trash/empty` - 清空
- `DELETE /trash/cleanup?days=N` - 清理

### 认证 `/api/auth`
- `POST /login` - 登录
- `POST /register` - 注册
- `GET /current` - 当前用户

## 响应格式
```typescript
// 统一响应
ApiResponse<T> { code: number; message: string; data: T }

// 分页响应
PageResponse<T> { list: T[]; total: number; page: number; pageSize: number }
```

## 代码规范
遵循 `.claude/` 目录下的规则文件：
- `api-rules.md` - API 接口规范
- `frontend-rules.md` - 前端代码规范
