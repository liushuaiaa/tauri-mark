<script setup lang="ts">
import { onMounted } from 'vue'
import { useMemoStore } from '../stores/memo'
import { ElButton, ElCard, ElEmpty, ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const store = useMemoStore()
const router = useRouter()

onMounted(() => {
  store.fetchMemos()
})

async function handleDelete(id: string, title: string) {
  try {
    await ElMessageBox.confirm(`确定要删除备忘录「${title}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.deleteMemo(id)
    ElMessage.success('删除成功')
  } catch {
    // user cancelled
  }
}

function formatDate(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="memo-list">
    <div class="header">
      <span></span>
      <ElButton type="primary" :icon="Plus" @click="router.push('/editor')">新建</ElButton>
    </div>

    <ElEmpty v-if="!store.loading && store.memos.length === 0" description="暂无备忘录，点击新建开始" />

    <div v-else class="card-list">
      <ElCard v-for="memo in store.memos" :key="memo.id" class="memo-card" shadow="hover">
        <div class="card-content">
          <div class="card-title">{{ memo.title || '无标题' }}</div>
          <div class="card-preview">{{ memo.content || '无内容' }}</div>
          <div class="card-footer">
            <span class="card-date">{{ formatDate(memo.updated_at) }}</span>
            <div class="card-actions">
              <ElButton :icon="Edit" size="small" @click="router.push(`/editor/${memo.id}`)">编辑</ElButton>
              <ElButton :icon="Delete" size="small" type="danger" @click="handleDelete(memo.id, memo.title)">删除</ElButton>
            </div>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.memo-list {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header h2 {
  margin: 0;
}
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.memo-card {
  cursor: default;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}
.card-preview {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-date {
  font-size: 12px;
  color: #999;
}
.card-actions {
  display: flex;
  gap: 8px;
}
</style>
