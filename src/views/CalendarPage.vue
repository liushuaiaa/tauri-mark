<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar } from 'v-calendar'
import { useMemoStore } from '../stores/memo'
import 'v-calendar/style.css'

const store = useMemoStore()
const router = useRouter()
const selectedDate = ref(new Date())

const attributes = computed(() => {
  const dates = new Set<string>()
  for (const m of store.memos) {
    const d = new Date(m.updated_at)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dates.add(dateStr)
  }
  return Array.from(dates).map(dateStr => ({
    dates: [new Date(dateStr + 'T00:00:00')],
    dot: true
  }))
})

function onDayClick(day: { date: Date }) {
  selectedDate.value = day.date
  const d = day.date
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  router.push({ path: '/editor', query: { date: dateStr } })
}
</script>

<template>
  <div class="calendar-page">
    <div class="calendar-container">
      <Calendar
        v-model:date="selectedDate"
        :attributes="attributes"
        @day-click="onDayClick"
        :is-expanded="true"
        :min-date="new Date('2020-01-01')"
        :max-date="new Date('2099-12-31')"
        style="width: 100%; min-height: 100%;"
      />
    </div>
  </div>
</template>

<style scoped>
.calendar-page {
  height: 100%;
  padding: 24px;
}
.calendar-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}
.calendar-container :deep(.vc-container) {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: none;
  overflow: hidden;
}
.calendar-container :deep(.vc-day) {
  min-height: 80px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  padding: 4px;
}
.calendar-container :deep(.vc-day-content) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 4px;
  transition: background 0.15s;
}
.calendar-container :deep(.vc-day-content:hover) {
  background: #f5f7fa;
}
.calendar-container :deep(.vc-highlight) {
  background: #409eff !important;
  border-radius: 4px;
}
.calendar-container :deep(.vc-outside) {
  pointer-events: auto;
}
.calendar-container :deep(.vc-outside .vc-day-content) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 4px;
  transition: background 0.15s;
}
.calendar-container :deep(.vc-outside .vc-day-content:hover) {
  background: #f5f7fa;
}
.calendar-container :deep(.vc-day:nth-child(7)) {
  border-right: none;
}
.calendar-container :deep(.vc-week:last-child .vc-day) {
  border-bottom: none;
}
</style>
