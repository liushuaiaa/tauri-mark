import api from '../axios/client'
import type { LoginRequest, RegisterRequest, AuthResponse } from './type/auth'

export type { LoginRequest, RegisterRequest, AuthResponse }

export const authApi = {
  login: (data: LoginRequest) => {
    return api.post<any, any>('/api/auth/login', data)
  },

  register: (data: RegisterRequest) => {
    return api.post<any, any>('/api/auth/register', data)
  },

  getCurrentUser: () => {
    return api.get<any, any>('/api/auth/me')
  }
}
