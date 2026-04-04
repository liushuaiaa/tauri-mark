<template>
  <div class="week-summary">
    <div class="header">
      <ElButton :icon="ArrowLeft" @click="router.push('/calendar')">返回</ElButton>
      <span class="date-title">{{ formattedDateRange }}</span>
      <div style="width: 60px"></div>
    </div>

    <div class="summary-container" v-if="weekMemos.length > 0">
      <div class="summary-content" v-html="mergedContent"></div>
    </div>

    <ElEmpty v-else description="本周暂无工作日记事本" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElButton, ElEmpty } from 'element-plus'
import { useMemoStore } from '../stores/memo'

const route = useRoute()
const router = useRouter()
const store = useMemoStore()

const dateStr = computed(() => route.query.date as string)

const formattedDateRange = computed(() => {
  if (!dateStr.value) return ''
  const sunday = new Date(dateStr.value)
  const monday = new Date(sunday)
  monday.setDate(sunday.getDate() - 6)
  return `${monday.getMonth() + 1}月${monday.getDate()}日 - ${sunday.getMonth() + 1}月${sunday.getDate()}日 本周汇总`
})

const weekMemos = computed(() => {
  if (!dateStr.value) return []
  const [year, month, day] = dateStr.value.split('-').map(Number)
  const sunday = new Date(year, month - 1, day)

  const monday = new Date(sunday)
  monday.setDate(sunday.getDate() - 6)
  monday.setHours(0, 0, 0, 0)

  const sundayEnd = new Date(sunday)
  sundayEnd.setHours(23, 59, 59, 999)

  return store.memos
    .filter((m) => {
      const d = new Date(m.created_at)
      const dayOfWeek = d.getDay()
      return d >= monday && d <= sundayEnd && dayOfWeek >= 1 && dayOfWeek <= 5
    })
    .sort((a, b) => a.created_at - b.created_at)
})

// 将所有记事本内容合并，用分隔线隔开
const mergedContent = computed(() => {
  return weekMemos.value
    .map((m) => {
      const d = new Date(m.created_at)
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      const titleHtml = m.title ? `<div class="content-title">${m.title} <span class="content-time">${timeStr}</span></div>` : `<div class="content-title"><span class="content-time">${timeStr}</span></div>`
      return titleHtml + m.content
    })
    .join('<div class="content-divider"></div>')
})
</script>

<style scoped>
.week-summary {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.summary-container {
  background: var(--color-bg-card);
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  padding: 32px;
}

.summary-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-primary);
}

.summary-content :deep(.content-title) {
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--color-border);
}

.summary-content :deep(.content-time) {
  font-weight: normal;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.summary-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-top: 12px;
}

.summary-content :deep(.content-divider) {
  height: 1px;
  background: var(--color-border);
  margin: 24px 0;
}
</style>
