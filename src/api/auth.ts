import { request } from '../axios/client'
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshRequest, ChangePasswordRequest } from './type/auth'

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

  // 刷新令牌（滑动续期）
  refresh = (data: RefreshRequest) => {
    return request<AuthResponse>({
      method: 'POST',
      url: '/api/auth/refresh',
      data
    })
  }

  // 退出登录（可携带 refresh token 通知后端吊销）
  logout = (data?: RefreshRequest) => {
    return request<void>({
      method: 'POST',
      url: '/api/auth/logout',
      data
    })
  }

  // 修改密码
  changePassword = (data: ChangePasswordRequest) => {
    return request<void>({
      method: 'POST',
      url: '/api/auth/change-password',
      data
    })
  }
}

export const authApi = new AuthApi()
