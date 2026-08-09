import { request } from '../axios/client'
import type { Feedback } from './type/feedback'

export class FeedbackApi {
  list = () => {
    return request<Feedback[]>({
      method: 'GET',
      url: '/api/feedback/list'
    })
  }

  query = (id: number) => {
    return request<Feedback>({
      method: 'GET',
      url: `/api/feedback/query/${id}`
    })
  }

  add = (data: Partial<Feedback>) => {
    return request<Feedback>({
      method: 'POST',
      url: '/api/feedback/add',
      data
    })
  }

  edit = (data: Partial<Feedback>) => {
    return request<Feedback>({
      method: 'POST',
      url: '/api/feedback/edit',
      data
    })
  }

  delete = (id: number) => {
    return request<void>({
      method: 'POST',
      url: `/api/feedback/delete/${id}`
    })
  }
}

export const feedbackApi = new FeedbackApi()
