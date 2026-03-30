<template>
  <div class="memo-list">
    <div class="header">
      <ElInput
        v-model="searchQuery"
        placeholder="搜索标题、内容..."
        :prefix-icon="Search"
        clearable
        style="width: 200px"
      />
      <ElDatePicker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 260px"
      />
      <ElButton type="primary" :icon="Plus" @click="router.push('/editor')">新建</ElButton>
    </div>

    <ElEmpty v-if="!store.loading && store.memos.length === 0" description="暂无备忘录，点击新建开始" />
    <ElEmpty v-else-if="filteredMemos.length === 0" description="未找到匹配的备忘录" />

    <div v-else class="card-list">
      <ElCard v-for="memo in filteredMemos" :key="memo.id" class="memo-card" shadow="hover">
        <div class="card-content">
          <div class="card-title">{{ memo.title || '无标题' }}</div>
          <div class="card-preview">{{ stripHtml(memo.content) || '无内容' }}</div>
          <div class="card-footer">
            <span class="card-date">{{ formatDate(memo.updated_at) }}</span>
            <div class="card-actions">
              <ElButton :icon="Edit" link @click="router.push(`/editor/${memo.id}`)">编辑</ElButton>
              <ElButton :icon="Delete" link type="danger" @click="handleDelete(memo.id, memo.title)">删除</ElButton>
            </div>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useMemoStore } from '../stores/memo'
import { ElButton, ElCard, ElDatePicker, ElEmpty, ElInput, ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import type { DateModelType } from 'element-plus'

const store = useMemoStore()
const router = useRouter()
const searchQuery = ref('')
const dateRange = ref<[DateModelType, DateModelType] | null>(null)

onMounted(() => {
  store.fetchMemos()
})

const filteredMemos = computed(() => {
  let memos = store.memos

  // Filter by text search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    memos = memos.filter(m => {
      const titleMatch = m.title.toLowerCase().includes(query)
      const contentMatch = stripHtml(m.content).toLowerCase().includes(query)
      return titleMatch || contentMatch
    })
  }

  // Filter by date range
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const start = new Date(dateRange.value[0]).getTime()
    const end = new Date(dateRange.value[1]).getTime() + 86400000 // include end day
    memos = memos.filter(m => m.updated_at >= start && m.updated_at <= end)
  }

  return memos
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

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
</script>

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
  gap: 16px;
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
  border-color: var(--color-border);
}
.memo-card:hover {
  border-color: var(--color-secondary);
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}
.card-preview {
  font-size: 14px;
  color: var(--color-text-secondary);
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
  color: var(--color-text-disabled);
}
.card-actions {
  display: flex;
  gap: 8px;
}
</style>
