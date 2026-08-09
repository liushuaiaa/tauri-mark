<template>
  <div class="user-page">
    <el-button text :icon="ArrowLeft" class="back-btn" @click="goBack">返回</el-button>

    <h1 class="page-title">个人信息</h1>

    <div class="section-card">
      <div class="section-title">基本信息</div>
      <div class="info-item">
        <span class="info-label">用户名</span>
        <span class="info-value">{{ currentUsername }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">用户ID</span>
        <span class="info-value">{{ currentUserId }}</span>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">修改密码</div>
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
import { ArrowLeft } from '@element-plus/icons-vue'
import CryptoJS from 'crypto-js'
import { authApi } from '../../api/auth'
import { currentUsername, currentUserId } from '../../stores/auth'

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

function goBack() {
  router.push('/')
}

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
    form.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch {
    // Error message is already shown by api/client.ts
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-page {
  padding: 24px;
  max-width: 700px;
  margin: 0 auto;
}

.back-btn {
  color: var(--color-text-secondary);
  padding: 0;
  margin-bottom: 8px;
}

.back-btn:hover {
  color: var(--color-primary);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 24px;
}

.section-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-light);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid var(--color-border-light);
}

.info-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--color-text-primary);
}

.section-card :deep(.el-form-item) {
  margin-bottom: 18px;
}

.section-card :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--color-border);
}

.section-card :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(255, 103, 0, 0.2);
  border-color: var(--color-primary);
}
</style>
