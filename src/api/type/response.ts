import type { Memo } from './memo'

// 分页列表响应
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 备忘录查询参数
export interface MemoListParams {
  keyword?: string
  startDate?: number
  endDate?: number
}

export interface MemoPageParams extends MemoListParams {
  page?: number
  pageSize?: number
}
