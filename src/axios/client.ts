import axios from 'axios'
import { ElMessage } from 'element-plus'

// 通用 API 响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USERNAME_KEY = 'auth_username'
const USERID_KEY = 'auth_userid'

// 单飞：并发 401 共享同一次刷新，避免重复调用 /refresh
let refreshPromise: Promise<void> | null = null

async function doRefresh(): Promise<void> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) throw new Error('no refresh token')
  const res = (await api.post('/api/auth/refresh', { refresh_token: refreshToken })) as ApiResponse<any>
  if (res.code === 200 && res.data?.refresh_token) {
    localStorage.setItem(TOKEN_KEY, res.data.token)
    localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refresh_token)
    return
  }
  throw new Error('refresh failed')
}

async function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function clearAuthAndRedirect() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(USERID_KEY)
  window.location.href = '/login'
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const url: string = error.config?.url || ''
    // 登录/注册/刷新/登出接口自身不做刷新（防死循环）
    const isAuthEndpoint = /\/api\/auth\/(login|register|refresh|logout)$/.test(url)
    const backendMessage = error.response?.data?.message
    const errorMessage = backendMessage || '请求失败'

    if (status === 401 || status === 403) {
      if (isAuthEndpoint) {
        // 刷新本身失败：提示后走登出（refresh 失败是前端「刷新失败→登出」的信号）
        if (url.endsWith('/refresh')) {
          ElMessage.error('登录已过期，请重新登录')
        } else {
          ElMessage.error(errorMessage)
        }
        if (error.response?.data) {
          return Promise.reject(error.response.data)
        }
        return Promise.reject(error)
      }

      // 受保护接口 401/403：单飞刷新并重试一次；刷新失败才跳登录页
      const config = error.config as any
      if (!config._retried) {
        config._retried = true
        return refreshAccessToken()
          .then(() => api(config))
          .catch(() => {
            clearAuthAndRedirect()
            ElMessage.error('登录已过期，请重新登录')
            if (error.response?.data) {
              return Promise.reject(error.response.data)
            }
            return Promise.reject(error)
          })
      }

      // 已重试过仍失败：刷新失效，清除凭据并跳登录页
      clearAuthAndRedirect()
      ElMessage.error('登录已过期，请重新登录')
      if (error.response?.data) {
        return Promise.reject(error.response.data)
      }
      return Promise.reject(error)
    }

    // 业务错误路径不变（400、413 等）
    ElMessage.error(errorMessage)

    // Return the error response data for business errors (like 400, 413)
    if (error.response?.data) {
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

// 封装请求方法，直接返回 ApiResponse<T>
export const request = <T>(config: any): Promise<ApiResponse<T>> => {
  return api(config) as Promise<ApiResponse<T>>
}

export default api
