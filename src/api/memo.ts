import { request, type ApiResponse } from '../axios/client'
import type { Memo } from './type/memo'
import type { PageResponse, MemoListParams, MemoPageParams } from './type/response'

export type { Memo }

export class MemoApi {
  // 列表
  list = (params?: MemoListParams) => {
    return request<Memo[]>({
      method: 'GET',
      url: '/api/memos/list',
      params
    })
  }

  // 分页列表
  page = (params?: MemoPageParams) => {
    return request<PageResponse<Memo>>({
      method: 'GET',
      url: '/api/memos/page',
      params
    })
  }

  // 查询
  query = (id: string) => {
    return request<Memo>({
      method: 'GET',
      url: `/api/memos/query/${id}`
    })
  }

  // 添加
  add = (data: Partial<Memo>) => {
    return request<Memo>({
      method: 'POST',
      url: '/api/memos/add',
      data
    })
  }

  // 编辑
  edit = (data: Partial<Memo>) => {
    return request<Memo>({
      method: 'PUT',
      url: '/api/memos/edit',
      data
    })
  }

  // 删除
  delete = (id: string) => {
    return request<void>({
      method: 'DELETE',
      url: `/api/memos/delete/${id}`
    })
  }

  // 永久删除
  permanentDelete = (id: string) => {
    return request<void>({
      method: 'DELETE',
      url: `/api/memos/delete/${id}/permanent`
    })
  }

  // 回收站列表
  trash = () => {
    return request<Memo[]>({
      method: 'GET',
      url: '/api/memos/trash'
    })
  }

  // 恢复
  restore = (id: string) => {
    return request<void>({
      method: 'POST',
      url: `/api/memos/trash/${id}/restore`
    })
  }

  // 清空回收站
  emptyTrash = () => {
    return request<void>({
      method: 'DELETE',
      url: '/api/memos/trash/empty'
    })
  }

  // 清理回收站
  cleanupTrash = (days: number) => {
    return request<void>({
      method: 'DELETE',
      url: `/api/memos/trash/cleanup?days=${days}`
    })
  }
}

export const memoApi = new MemoApi()
