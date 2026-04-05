---
paths:
  - "src/api/**/*"
  - "src/axios/**/*"
---

# API 规范

## 接口文件写法

### 目录结构
```
src/api/
  xxx.ts           # 接口文件 (class 方式)
  type/
    xxx.ts         # 相关类型定义
    response.ts    # 通用响应类型
```

### 文件模板
```typescript
import { request } from '../axios/client'
import type { XXX } from './type/xxx'
import type { PageResponse, XXXParams } from './type/response'

export class XxxApi {
  // 列表
  list = (params?: XXXParams) =>
    request<XXX[]>({ method: 'GET', url: '/api/xxx/list', params })

  // 分页列表
  page = (params?: XXXPageParams) =>
    request<PageResponse<XXX>>({ method: 'GET', url: '/api/xxx/page', params })

  // 查询
  query = (id: string) =>
    request<XXX>({ method: 'GET', url: `/api/xxx/query/${id}` })

  // 添加
  add = (data: Partial<XXX>) =>
    request<XXX>({ method: 'POST', url: '/api/xxx/add', data })

  // 编辑
  edit = (data: Partial<XXX>) =>
    request<XXX>({ method: 'PUT', url: '/api/xxx/edit', data })

  // 删除
  delete = (id: string) =>
    request<void>({ method: 'DELETE', url: `/api/xxx/delete/${id}` })
}

export const xxxApi = new XxxApi()
```

### 命名规则
- 类名：`XxxApi`（驼峰，Api 后缀）
- 实例：`xxxApi`（小写下划线转驼峰）
- 方法：与后端路径动作对应 `list` / `page` / `query` / `add` / `edit` / `delete`

## 类型文件写法

### src/api/type/response.ts
```typescript
// 分页响应
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 查询参数（列表用）
export interface XxxListParams {
  keyword?: string
  startDate?: number
  endDate?: number
}

// 查询参数（分页用）
export interface XxxPageParams extends XxxListParams {
  page?: number
  pageSize?: number
}
```

### src/api/type/xxx.ts
```typescript
// 实体类型
export interface Xxx {
  id: string
  // ...
}
```

## 公共类型位置

### 响应类型
- `src/axios/client.ts` - `ApiResponse<T>` 定义和 `request` 封装
- `src/api/type/response.ts` - `PageResponse<T>` 等通用类型

### 不要重复导出
类型只在定义位置导出，使用方自行从对应文件 import。
