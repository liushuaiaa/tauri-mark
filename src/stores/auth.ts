import { ref } from 'vue'
import { authApi } from '../api/auth'

const STORAGE_TOKEN_KEY = 'auth_token'
const STORAGE_USERNAME_KEY = 'auth_username'
const STORAGE_USERID_KEY = 'auth_userid'

function getInitialLoggedIn(): boolean {
  return !!localStorage.getItem(STORAGE_TOKEN_KEY)
}

function getInitialUsername(): string | null {
  return localStorage.getItem(STORAGE_USERNAME_KEY)
}

export const isLoggedIn = ref(getInitialLoggedIn())
export const currentUsername = ref(getInitialUsername())

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY)
}

export async function checkAuthSetup(): Promise<boolean> {
  // Always return true since we're using remote API now
  return true
}

// 验证当前 token 是否有效
export async function validateToken(): Promise<boolean> {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY)
  if (!token) {
    return false
  }
  try {
    const response = await authApi.current()
    if (response.code === 200) {
      // token 有效，更新用户信息
      isLoggedIn.value = true
      currentUsername.value = response.data.username
      return true
    }
  } catch (e: any) {
    // token 无效或已过期
    console.warn('Token validation failed:', e)
  }
  // token 无效，清除状态
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  localStorage.removeItem(STORAGE_USERNAME_KEY)
  localStorage.removeItem(STORAGE_USERID_KEY)
  isLoggedIn.value = false
  currentUsername.value = null
  return false
}

export async function register(username: string, password: string): Promise<boolean> {
  try {
    const response = await authApi.register({ username, password })
    if (response.code === 200) {
      localStorage.setItem(STORAGE_TOKEN_KEY, response.data.token)
      localStorage.setItem(STORAGE_USERNAME_KEY, response.data.username)
      localStorage.setItem(STORAGE_USERID_KEY, String(response.data.userId))
      isLoggedIn.value = true
      currentUsername.value = response.data.username
      return true
    } else {
      throw new Error(response.message)
    }
  } catch (e: any) {
    console.error('Failed to register:', e)
    const message = e?.response?.data?.message || e?.message || '注册失败'
    throw new Error(message)
  }
}

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await authApi.login({ username, password })
    if (response.code === 200) {
      localStorage.setItem(STORAGE_TOKEN_KEY, response.data.token)
      localStorage.setItem(STORAGE_USERNAME_KEY, response.data.username)
      localStorage.setItem(STORAGE_USERID_KEY, String(response.data.userId))
      isLoggedIn.value = true
      currentUsername.value = response.data.username
      return true
    } else {
      throw new Error(response.message)
    }
  } catch (e: any) {
    console.error('Failed to login:', e)
    throw e
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  localStorage.removeItem(STORAGE_USERNAME_KEY)
  localStorage.removeItem(STORAGE_USERID_KEY)
  isLoggedIn.value = false
  currentUsername.value = null
}
