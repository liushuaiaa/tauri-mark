<template>
  <div class="change-password-page">
    <div class="card">
      <h1 class="page-title">修改密码</h1>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-button
          type="primary"
          class="submit-btn"
          :loading="loading"
          @click="handleSubmit"
        >
          确认修改
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CryptoJS from 'crypto-js'
import { authApi } from '../../api/auth'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== form.value.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 4, message: '密码至少4位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 4, message: '密码至少4位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await authApi.changePassword({
      old_password: CryptoJS.SHA256(form.value.oldPassword).toString(),
      new_password: CryptoJS.SHA256(form.value.newPassword).toString()
    })
    ElMessage.success('密码修改成功')
    router.push('/')
  } catch {
    // Error message is already shown by api/client.ts
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
}

.card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 36px 32px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
}

.page-title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 24px;
  letter-spacing: 2px;
}

.submit-btn {
  width: 100%;
  height: 42px;
  border-radius: 8px;
  font-size: 15px;
  margin-top: 8px;
}

.card :deep(.el-form-item) {
  margin-bottom: 20px;
}

.card :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--color-border);
}

.card :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(255, 103, 0, 0.2);
  border-color: var(--color-primary);
}
</style>
