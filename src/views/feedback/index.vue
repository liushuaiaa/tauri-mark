<template>
  <div class="feedback-view">
    <div class="page-header">
      <h1 class="page-title">反馈管理</h1>
      <ElButton type="primary" :icon="Plus" @click="openAddDialog">新建反馈</ElButton>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <ElIcon class="loading-icon" :size="24"><Loading /></ElIcon>
      <span>加载中...</span>
    </div>

    <ElEmpty v-else-if="store.feedbacks.length === 0" description="暂无反馈" />

    <div v-else class="feedback-list">
      <div v-for="item in store.feedbacks" :key="item.id" class="feedback-card">
        <div class="card-header">
          <span class="card-title">{{ item.title }}</span>
          <ElTag :type="statusType(item.status)" size="small">
            {{ statusLabel(item.status) }}
          </ElTag>
        </div>
        <p class="card-content">{{ item.content }}</p>
        <div class="card-footer">
          <span class="card-time">{{ formatTime(item.created_at) }}</span>
          <div class="card-actions">
            <ElButton text type="primary" size="small" @click="openEditDialog(item)">编辑</ElButton>
            <ElButton text type="danger" size="small" @click="handleDelete(item.id)">删除</ElButton>
          </div>
        </div>
      </div>
    </div>

    <FeedbackDialog v-model="dialogVisible" :feedback="editFeedback" @confirm="handleConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElButton, ElEmpty, ElIcon, ElMessage, ElMessageBox, ElTag } from 'element-plus'
import { Plus, Loading } from '@element-plus/icons-vue'
import { useFeedbackStore } from '../../stores/feedback'
import type { Feedback } from '../../api/type/feedback'
import FeedbackDialog from './common/FeedbackDialog.vue'

const store = useFeedbackStore()
const loading = ref(false)
const dialogVisible = ref(false)
const editFeedback = ref<Feedback | null>(null)

onMounted(async () => {
  loading.value = true
  await store.fetchFeedbacks()
  loading.value = false
})

function openAddDialog() {
  editFeedback.value = null
  dialogVisible.value = true
}

function openEditDialog(item: Feedback) {
  editFeedback.value = item
  dialogVisible.value = true
}

async function handleConfirm(data: { title: string; content: string }) {
  if (editFeedback.value) {
    await store.editFeedback({ id: editFeedback.value.id, ...data })
    ElMessage.success('反馈已更新')
  } else {
    await store.addFeedback(data)
    ElMessage.success('反馈已提交')
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该反馈吗？', '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await store.deleteFeedback(id)
    ElMessage.success('反馈已删除')
  } catch {
    // cancelled
  }
}

function statusType(status: string) {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'RESOLVED': return 'success'
    case 'CLOSED': return 'info'
    default: return 'info'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'PENDING': return '待处理'
    case 'RESOLVED': return '已解决'
    case 'CLOSED': return '已关闭'
    default: return status
  }
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.feedback-view {
  padding: 24px;
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-content {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.card-actions {
  display: flex;
  gap: 8px;
}
</style>
