<template>
  <div class="memo-list">
    <div class="header">
      <ElInput
        v-model="searchQuery"
        placeholder="搜索标题、内容..."
        :prefix-icon="Search"
        clearable
        style="width: 200px"
        @input="handleSearch"
      />
      <ElDatePicker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 260px"
        @change="handleSearch"
      />
      <ElButton type="primary" :icon="Plus" @click="router.push('/editor')">新建</ElButton>
    </div>

    <ElEmpty v-if="!store.loading && store.memos.length === 0" description="暂无记事本，点击新建开始" />
    <ElEmpty v-else-if="store.memos.length === 0" description="未找到匹配的记事本" />

    <div v-else class="card-list" ref="listRef">
      <ElCard v-for="memo in store.memos" :key="memo.id" class="memo-card" shadow="hover">
        <div class="card-content">
          <div class="card-title">
            {{ memo.title || '无标题' }}
            <el-icon v-if="memo.encrypted" class="encrypted-icon"><Lock /></el-icon>
            <span v-if="memo.weather_icon" class="weather-badge">
              {{ memo.weather_icon }} {{ memo.weather_temp }}°C
            </span>
          </div>
          <div class="card-preview" v-if="getPreviewImage(memo.content)">
            <img :src="getPreviewImage(memo.content)!" class="preview-image" alt="预览" />
            <span v-if="stripHtml(memo.content)" class="preview-text">{{ stripHtml(memo.content) }}</span>
          </div>
          <div class="card-preview" v-else>{{ stripHtml(memo.content) || '无内容' }}</div>
          <div class="card-footer">
            <span class="card-date">{{ formatDate(memo.created_at) }}</span>
            <div class="card-actions">
              <ElButton
                v-for="action in cardActions"
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
        </div>
      </ElCard>
      <div v-if="store.loading" class="loading-more">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="!hasMore && store.memos.length > 0" class="no-more">
        没有更多了
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMemoStore } from '../../stores/memo'
import { ElButton, ElCard, ElDatePicker, ElEmpty, ElIcon, ElInput, ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Loading, Lock, Plus, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const store = useMemoStore()
const router = useRouter()
const searchQuery = ref('')

const cardActions = [
  { type: 'default' as const, icon: Edit, label: '编辑', handler: (id: string) => router.push(`/editor/${id}`) },
  { type: 'danger' as const, icon: Delete, label: '删除', handler: handleTrash },
]
const dateRange = ref<[Date, Date] | null>(null)
const listRef = ref<HTMLElement | null>(null)

onMounted(() => {
  store.fetchMemos()
  const elMain = document.querySelector('.el-main')
  if (elMain) {
    elMain.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const elMain = document.querySelector('.el-main')
  if (elMain) {
    elMain.removeEventListener('scroll', handleScroll)
  }
})

function handleSearch() {
  store.fetchMemos({
    keyword: searchQuery.value || undefined,
    startDate: dateRange.value?.[0]?.getTime(),
    endDate: dateRange.value?.[1] ? dateRange.value[1].getTime() + 86400000 : undefined
  })
}

async function handleTrash(id: string, title: string) {
  try {
    await ElMessageBox.confirm(`确定要将记事本「${title}」移入回收站吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.trashMemo(id)
    ElMessage.success('已移入回收站')
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

function getPreviewImage(html: string): string | null {
  const div = document.createElement('div')
  div.innerHTML = html
  const img = div.querySelector('img')
  return img?.src || null
}

const hasMore = computed(() => {
  return store.memos.length < store.total
})

function handleScroll() {
  if (store.loading || !hasMore.value) return

  const elMain = document.querySelector('.el-main') as HTMLElement
  if (!elMain) return

  const { scrollTop, scrollHeight, clientHeight } = elMain
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    store.loadMoreMemos({
      keyword: searchQuery.value || undefined,
      startDate: dateRange.value?.[0]?.getTime(),
      endDate: dateRange.value?.[1] ? dateRange.value[1].getTime() + 86400000 : undefined
    })
  }
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.encrypted-icon {
  color: var(--color-primary);
}

.weather-badge {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-page);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: auto;
}

.card-preview {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-image {
  max-width: 100%;
  max-height: 120px;
  border-radius: 4px;
  object-fit: cover;
  display: block;
  margin-bottom: 8px;
}
.preview-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
  font-size: 14px;
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
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--color-text-secondary);
  font-size: 14px;
}
.loading-more .loading-icon {
  animation: rotate 1s linear infinite;
}
.no-more {
  text-align: center;
  padding: 16px;
  color: var(--color-text-disabled);
  font-size: 14px;
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
