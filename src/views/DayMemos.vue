<template>
  <div class="day-memos">
    <div class="header">
      <ElButton :icon="ArrowLeft" @click="router.back()">返回</ElButton>
      <span class="date-title">{{ formattedDate }}</span>
      <div style="width: 60px"></div>
    </div>

    <div class="memos-container" v-if="dayMemos.length > 0">
      <div
        v-for="memo in dayMemos"
        :key="memo.id"
        class="memo-content"
        v-html="memo.content"
      ></div>
    </div>

    <ElEmpty v-else :description="dateStr && new Date(dateStr).getDay() === 0 ? '本周暂无工作日备忘录' : '这天没有备忘录'" />
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

const formattedDate = computed(() => {
  if (!dateStr.value) return ''
  const d = new Date(dateStr.value)
  if (d.getDay() === 0) {
    // 周日显示本周日期范围
    const monday = new Date(d)
    monday.setDate(d.getDate() - 6)
    return `${monday.getMonth() + 1}月${monday.getDate()}日 - ${d.getMonth() + 1}月${d.getDate()}日 本周汇总`
  }
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

const dayMemos = computed(() => {
  if (!dateStr.value) return []
  const [year, month, day] = dateStr.value.split('-').map(Number)
  const selectedDate = new Date(year, month - 1, day)

  // 如果是周日，返回本周一到周五的所有备忘录
  if (selectedDate.getDay() === 0) {
    const monday = new Date(selectedDate)
    monday.setDate(selectedDate.getDate() - 6)
    monday.setHours(0, 0, 0, 0)
    const sundayEnd = new Date(selectedDate)
    sundayEnd.setHours(23, 59, 59, 999)

    return store.memos.filter((m) => {
      const d = new Date(m.created_at)
      const dayOfWeek = d.getDay()
      return d >= monday && d <= sundayEnd && dayOfWeek >= 1 && dayOfWeek <= 5
    }).sort((a, b) => a.created_at - b.created_at) // 按时间正序排列
  }

  // 否则返回当天的备忘录
  return store.memos.filter((m) => {
    const d = new Date(m.created_at)
    return (
      d.getFullYear() === year &&
      d.getMonth() + 1 === month &&
      d.getDate() === day
    )
  })
})
</script>

<style scoped>
.day-memos {
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

.memos-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.memo-content {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-primary);
  min-height: 100px;
}

.memo-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-top: 12px;
}
</style>
