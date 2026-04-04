import api from '../axios/client'
import type { Memo } from './type/memo'

export type { Memo }

export interface MemoListResponse {
  list: Memo[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export const memoApi = {
  getMemos: (params?: {
    keyword?: string
    startDate?: number
    endDate?: number
    page?: number
    pageSize?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.set('keyword', params.keyword)
    if (params?.startDate) queryParams.set('startDate', String(params.startDate))
    if (params?.endDate) queryParams.set('endDate', String(params.endDate))
    if (params?.page) queryParams.set('page', String(params.page))
    if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize))
    const query = queryParams.toString()
    return api.get<ApiResponse<MemoListResponse>>(`/api/memos${query ? '?' + query : ''}`) as unknown as Promise<ApiResponse<MemoListResponse>>
  },

  getMemo: (id: string) => {
    return api.get<ApiResponse<Memo>>(`/api/memos/${id}`) as unknown as Promise<ApiResponse<Memo>>
  },

  createMemo: (memo: Partial<Memo>) => {
    return api.post<ApiResponse<Memo>>('/api/memos', memo) as unknown as Promise<ApiResponse<Memo>>
  },

  updateMemo: (id: string, memo: Partial<Memo>) => {
    return api.put<ApiResponse<Memo>>(`/api/memos/${id}`, memo) as unknown as Promise<ApiResponse<Memo>>
  },

  deleteMemo: (id: string) => {
    return api.delete<ApiResponse<void>>(`/api/memos/${id}`) as unknown as Promise<ApiResponse<void>>
  },

  permanentDeleteMemo: (id: string) => {
    return api.delete<ApiResponse<void>>(`/api/memos/${id}/permanent`) as unknown as Promise<ApiResponse<void>>
  },

  getTrash: () => {
    return api.get<ApiResponse<Memo[]>>('/api/memos/trash') as unknown as Promise<ApiResponse<Memo[]>>
  },

  restoreMemo: (id: string) => {
    return api.post<ApiResponse<void>>(`/api/memos/trash/${id}/restore`) as unknown as Promise<ApiResponse<void>>
  },

  emptyTrash: () => {
    return api.delete<ApiResponse<void>>('/api/memos/trash/empty') as unknown as Promise<ApiResponse<void>>
  },

  cleanupTrash: (days: number) => {
    return api.delete<ApiResponse<void>>(`/api/memos/trash/cleanup?days=${days}`) as unknown as Promise<ApiResponse<void>>
  }
}
