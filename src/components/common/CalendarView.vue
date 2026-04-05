<template>
  <Calendar
    :attributes="attributes"
    @day-click="onDayClick"
    :is-expanded="true"
    :columns="1"
  >
    <template #day-content="{ day }">
      <div class="day-cell">
        <span class="day-number">{{ day.day }}</span>
        <span v-if="hasMemo(day.date)" class="memo-indicator">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12">
            <path d="M0 0v12h14V3.5L10 0H0z" fill="#FF6700" stroke="#E65C00" stroke-width="0.5"/>
            <path d="M0 3.5h14" stroke="#E65C00" stroke-width="0.5"/>
          </svg>
        </span>
      </div>
    </template>
  </Calendar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar } from 'v-calendar'
import type { Memo } from '../../api/type/memo'
import 'v-calendar/style.css'

const props = defineProps<{
  memos: Memo[]
}>()

const router = useRouter()

const attributes = computed(() => {
  const dates = new Set<string>()
  for (const m of props.memos) {
    const d = new Date(m.updated_at)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dates.add(dateStr)
  }

  return Array.from(dates).map(dateStr => ({
    dates: [new Date(dateStr + 'T00:00:00')],
    indicator: { style: { display: 'none' } }
  }))
})

function hasMemo(date: Date): boolean {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return props.memos.some(m => {
    const d = new Date(m.updated_at)
    const mDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return mDateStr === dateStr
  })
}

function onDayClick(day: { date: Date }) {
  const d = day.date
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  router.push({ path: '/editor', query: { date: dateStr } })
}
</script>

<style scoped>
.day-cell {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.day-number {
  line-height: 1;
}

.memo-indicator {
  position: absolute;
  bottom: 2px;
  right: 4px;
  line-height: 1;
}
</style>
