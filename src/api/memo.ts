import api from '../axios/client'
import type { Memo, ApiResponse } from './type/memo'

export type { Memo, ApiResponse }

export const memoApi = {
  getMemos: () => {
    return api.get<ApiResponse<Memo[]>>('/api/memos')
  },

  getMemo: (id: string) => {
    return api.get<ApiResponse<Memo>>(`/api/memos/${id}`)
  },

  createMemo: (memo: Partial<Memo>) => {
    return api.post<ApiResponse<Memo>>('/api/memos', memo)
  },

  updateMemo: (id: string, memo: Partial<Memo>) => {
    return api.put<ApiResponse<Memo>>(`/api/memos/${id}`, memo)
  },

  deleteMemo: (id: string) => {
    return api.delete<ApiResponse<void>>(`/api/memos/${id}`)
  },

  permanentDeleteMemo: (id: string) => {
    return api.delete<ApiResponse<void>>(`/api/memos/${id}/permanent`)
  },

  getTrash: () => {
    return api.get<ApiResponse<Memo[]>>('/api/memos/trash')
  },

  restoreMemo: (id: string) => {
    return api.post<ApiResponse<void>>(`/api/memos/trash/${id}/restore`)
  },

  emptyTrash: () => {
    return api.delete<ApiResponse<void>>('/api/memos/trash/empty')
  },

  cleanupTrash: (days: number) => {
    return api.delete<ApiResponse<void>>(`/api/memos/trash/cleanup?days=${days}`)
  }
}
