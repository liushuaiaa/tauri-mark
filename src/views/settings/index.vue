<template>
  <div class="settings-view">
    <h1 class="page-title">设置</h1>

    <div class="settings-section">
      <div class="section-title">数据管理</div>
      <div class="settings-item">
        <div class="item-info">
          <span class="item-label">清理回收站</span>
          <span class="item-desc">删除指定天数前的回收站记事本</span>
        </div>
        <div class="item-action">
          <ElInputNumber v-model="cleanupDays" :min="1" :max="365" />
          <ElButton type="primary" @click="handleCleanup">清理</ElButton>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">账号</div>
      <div class="settings-item">
        <div class="item-info">
          <span class="item-label">退出登录</span>
          <span class="item-desc">清除本地登录状态并返回登录页</span>
        </div>
        <ElButton type="danger" plain @click="handleLogout">退出登录</ElButton>
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">反馈</div>
      <div class="settings-item">
        <div class="item-info">
          <span class="item-label">反馈与建议</span>
          <span class="item-desc">提交 Bug 反馈或功能建议</span>
        </div>
        <ElButton type="primary" @click="goFeedback">去反馈</ElButton>
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">关于</div>
      <div class="settings-item">
        <span class="item-label">版本</span>
        <span class="item-value">{{ appVersion || '-' }}</span>
      </div>
      <div class="settings-item">
        <span class="item-label">技术栈</span>
        <span class="item-value">Tauri v2 + Vue 3 + TypeScript</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVersion } from '@tauri-apps/api/app'
import { ElButton, ElInputNumber, ElMessage, ElMessageBox } from 'element-plus'
import { useTrashStore } from '../../stores/trash'
import { logout } from '../../stores/auth'

const router = useRouter()
const trashStore = useTrashStore()
const cleanupDays = ref(7)
const appVersion = ref('')

onMounted(async () => {
  appVersion.value = await getVersion()
})

function goFeedback() {
  router.push('/feedback')
}

async function handleCleanup() {
  await trashStore.cleanupTrash(cleanupDays.value)
  ElMessage.success(`已清理 ${cleanupDays.value} 天前的回收站记事本`)
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.settings-view {
  padding: 24px;
  max-width: 700px;
  margin: 0 auto;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 32px;
}

.settings-section {
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

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.settings-item:not(:last-child) {
  border-bottom: 1px solid var(--color-border-light);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-label {
  font-size: 14px;
  color: var(--color-text-primary);
}

.item-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.item-action {
  display: flex;
  gap: 12px;
  align-items: center;
}

.item-value {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
