<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar } from 'v-calendar'
import type { Memo } from '../stores/memo'
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
    dot: true
  }))
})

function onDayClick(day: { date: Date }) {
  const d = day.date
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  router.push({ path: '/editor', query: { date: dateStr } })
}
</script>

<template>
  <Calendar
    :attributes="attributes"
    @day-click="onDayClick"
    :is-expanded="true"
    :columns="1"
  />
</template>

<style scoped>
</style>
