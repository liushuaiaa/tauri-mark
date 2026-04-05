import { request, type ApiResponse } from '../axios/client'
import type { LoginRequest, RegisterRequest, AuthResponse } from './type/auth'

export class AuthApi {
  // 登录
  login = (data: LoginRequest) => {
    return request<AuthResponse>({
      method: 'POST',
      url: '/api/auth/login',
      data
    })
  }

  // 注册
  register = (data: RegisterRequest) => {
    return request<AuthResponse>({
      method: 'POST',
      url: '/api/auth/register',
      data
    })
  }

  // 获取当前用户
  current = () => {
    return request<AuthResponse>({
      method: 'GET',
      url: '/api/auth/current'
    })
  }
}

export const authApi = new AuthApi()
