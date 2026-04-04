import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

interface AuthConfig {
  password_hash: string
  salt: string
}

const STORAGE_KEY = 'auth_logged_in'

function getInitialValue(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return JSON.parse(stored)
  } catch {}
  return false
}

export const isLoggedIn = ref(getInitialValue())

export function setLoggedIn(value: boolean) {
  isLoggedIn.value = value
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {}
}

export async function checkAuthSetup(): Promise<boolean> {
  try {
    const config = await invoke<AuthConfig | null>('get_auth_config')
    return config !== null && config.password_hash !== ''
  } catch {
    return false
  }
}

export async function setupPassword(password: string): Promise<boolean> {
  try {
    await invoke('save_auth_config', { password })
    setLoggedIn(true)
    return true
  } catch (e) {
    console.error('Failed to setup password:', e)
    return false
  }
}

export async function login(password: string): Promise<boolean> {
  try {
    const success = await invoke<boolean>('verify_password', { password })
    if (success) {
      setLoggedIn(true)
    }
    return success
  } catch (e) {
    console.error('Failed to login:', e)
    return false
  }
}

export function logout() {
  setLoggedIn(false)
}
