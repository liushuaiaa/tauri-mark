export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  username: string
  userId: number
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}
