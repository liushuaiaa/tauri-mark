<template>
  <div class="trash-view">
    <div class="header">
      <span class="page-title">回收站</span>
      <div class="header-action">
        <ElButton
          v-if="store.trashedMemos.length > 0"
          type="danger"
          :icon="Delete"
          @click="handleEmptyTrash"
        >
          清空
        </ElButton>
      </div>
    </div>

    <ElEmpty v-if="!store.loading && store.trashedMemos.length === 0" description="回收站是空的" />

    <div v-else class="trash-list">
      <ElCard v-for="memo in store.trashedMemos" :key="memo.id" class="trash-card" shadow="hover">
        <div class="trash-main">
          <div class="trash-content">
            <div class="trash-title">{{ memo.title || '无标题' }}</div>
            <div class="trash-preview">{{ stripHtml(memo.content) || '无内容' }}</div>
            <div class="trash-date">删除于 {{ formatDate(memo.deleted_at) }}</div>
          </div>
          <div class="trash-actions">
            <ElButton
              v-for="action in trashActions"
              :key="action.type"
              :icon="action.icon"
              link
              :type="action.type"
              @click="action.handler(memo.id, memo.title)"
            >
              {{ action.label }}
            </ElButton>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Delete, Refresh } from '@element-plus/icons-vue'
import { ElButton, ElCard, ElEmpty, ElMessage, ElMessageBox } from 'element-plus'
import { useTrashStore } from '../../stores/trash'

const store = useTrashStore()

const trashActions = [
  { type: 'default' as const, icon: Refresh, label: '恢复', handler: handleRestore },
  { type: 'danger' as const, icon: Delete, label: '删除', handler: handlePermanentDelete },
]

onMounted(() => {
  store.fetchTrashed()
})

async function handleRestore(id: string) {
  await store.restoreMemo(id)
  ElMessage.success('已恢复')
}

async function handlePermanentDelete(id: string, title: string) {
  try {
    await ElMessageBox.confirm(`确定要删除「${title || '无标题'}」吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.permanentDelete(id)
    ElMessage.success('已删除')
  } catch {
    // user cancelled
  }
}

async function handleEmptyTrash() {
  try {
    await ElMessageBox.confirm('确定要清空回收站吗？此操作不可恢复！', '清空回收站确认', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.emptyTrash()
    ElMessage.success('回收站已清空')
  } catch {
    // user cancelled
  }
}

function formatDate(ts: number | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
</script>

<style scoped>
.trash-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.header-action {
  position: absolute;
  right: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.trash-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trash-card {
  cursor: default;
  opacity: 0.9;
}

.trash-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.trash-content {
  flex: 1;
  min-width: 0;
}

.trash-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.trash-preview {
  font-size: 14px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.trash-date {
  font-size: 12px;
  color: var(--color-text-disabled);
}

.trash-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
