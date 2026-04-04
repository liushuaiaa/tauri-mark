import axios from 'axios'
import { ElMessage } from 'element-plus'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const TOKEN_KEY = 'auth_token'
const USERNAME_KEY = 'auth_username'
const USERID_KEY = 'auth_userid'

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
    // Extract error message from backend response
    const backendMessage = error.response?.data?.message
    const errorMessage = backendMessage || '请求失败'

    ElMessage.error(errorMessage)

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USERNAME_KEY)
      localStorage.removeItem(USERID_KEY)
      window.location.href = '/login'
    }

    // Return the error response data for business errors (like 400)
    if (error.response?.data) {
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

export default api
