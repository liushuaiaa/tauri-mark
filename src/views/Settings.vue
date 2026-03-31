<template>
  <div class="settings-view">
    <h1 class="page-title">设置</h1>

    <div class="settings-section">
      <div class="section-title">数据管理</div>
      <div class="settings-item">
        <div class="item-info">
          <span class="item-label">清理回收站</span>
          <span class="item-desc">删除指定天数前的回收站备忘录</span>
        </div>
        <div class="item-action">
          <ElInputNumber v-model="cleanupDays" :min="1" :max="365" />
          <ElButton type="primary" @click="handleCleanup">清理</ElButton>
        </div>
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
import { getVersion } from '@tauri-apps/api/app'
import { ElButton, ElInputNumber, ElMessage } from 'element-plus'
import { useTrashStore } from '../stores/trash'

const trashStore = useTrashStore()
const cleanupDays = ref(7)
const appVersion = ref('')

onMounted(async () => {
  appVersion.value = await getVersion()
})

async function handleCleanup() {
  await trashStore.cleanupTrash(cleanupDays.value)
  ElMessage.success(`已清理 ${cleanupDays.value} 天前的回收站备忘录`)
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
