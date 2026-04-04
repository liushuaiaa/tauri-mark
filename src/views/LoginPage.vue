<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
    </div>

    <div class="login-card">
      <div class="login-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="url(#iconGrad)"/>
          <path d="M14 16h20v4H14zM14 24h20v4H14zM14 32h12v4H14z" fill="white" opacity="0.9"/>
          <defs>
            <linearGradient id="iconGrad" x1="0" y1="0" x2="48" y2="48">
              <stop stop-color="#FF6700"/>
              <stop offset="1" stop-color="#E65C00"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h1 class="app-title">记事本</h1>
      <p class="login-subtitle">{{ isRegister ? '注册账号' : '登录账号' }}</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="isRegister ? '请设置密码' : '请输入密码'"
            show-password
            size="large"
            @keyup.enter="handleSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="isRegister" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
            size="large"
            @keyup.enter="handleSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="!isRegister">
          <div class="remember-row">
            <el-checkbox v-model="rememberPwd">记住账号密码</el-checkbox>
          </div>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="submit-btn"
          @click="handleSubmit"
        >
          {{ isRegister ? '注 册' : '登 录' }}
        </el-button>
      </el-form>

      <div class="switch-mode">
        <span v-if="!isRegister">还没有账号？</span>
        <span v-else>已有账号？</span>
        <el-button type="primary" link @click="switchMode">
          {{ isRegister ? '立即登录' : '立即注册' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import CryptoJS from 'crypto-js'
import { checkAuthSetup, login, logout, register } from '../stores/auth'

const router = useRouter()

const formRef = ref()
const loading = ref(false)
const isRegister = ref(false)
const rememberPwd = ref(false)

const REMEMBER_USERNAME_KEY = 'remember_username'
const REMEMBER_PASSWORD_KEY = 'remember_password'

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (isRegister.value && value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码至少4位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))

onMounted(async () => {
  logout()
  isRegister.value = !(await checkAuthSetup())
  // Load saved credentials
  const savedUsername = localStorage.getItem(REMEMBER_USERNAME_KEY)
  const savedPassword = localStorage.getItem(REMEMBER_PASSWORD_KEY)
  if (savedUsername && savedPassword) {
    form.value.username = savedUsername
    form.value.password = savedPassword
    rememberPwd.value = true
  }
})

function switchMode() {
  isRegister.value = !isRegister.value
  form.value = {
    username: '',
    password: '',
    confirmPassword: ''
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true

  try {
    // Always encrypt password with SHA-256 before sending to backend
    const encryptedPassword = CryptoJS.SHA256(form.value.password).toString()

    if (isRegister.value) {
      if (form.value.password !== form.value.confirmPassword) {
        return
      }
      await register(form.value.username, encryptedPassword)
      ElMessage.success('注册成功')
      router.push('/')
    } else {
      await login(form.value.username, encryptedPassword)
      ElMessage.success('登录成功')
      // Remember credentials: save original password
      if (rememberPwd.value) {
        localStorage.setItem(REMEMBER_USERNAME_KEY, form.value.username)
        localStorage.setItem(REMEMBER_PASSWORD_KEY, form.value.password)
      } else {
        localStorage.removeItem(REMEMBER_USERNAME_KEY)
        localStorage.removeItem(REMEMBER_PASSWORD_KEY)
      }
      router.push('/')
    }
  } catch {
    // Error message is already shown by ElMessage in api/client.ts
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  top: -100px;
  right: -100px;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: var(--color-secondary);
  bottom: -50px;
  left: -50px;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 16px;
  padding: 48px 40px 40px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.login-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.app-title {
  text-align: center;
  font-size: 26px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.login-subtitle {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
}

.login-form {
  margin-top: 0;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--color-border);
  transition: all 0.2s;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-primary-light);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(255, 103, 0, 0.2);
  border-color: var(--color-primary);
}

.login-form :deep(.el-input__inner) {
  font-size: 15px;
  height: 40px;
}

.login-form :deep(.el-input__prefix .el-icon) {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 4px;
  margin-top: 8px;
  transition: all 0.2s;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 103, 0, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.switch-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.remember-row {
  display: flex;
  align-items: center;
}
</style>
