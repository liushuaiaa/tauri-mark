<template>
  <div class="custom-calendar">
    <!-- 头部：年月和导航按钮 -->
    <div class="calendar-header">
      <el-button :icon="ArrowLeft" text @click="prevMonth" />
      <span class="calendar-title">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
      <el-button :icon="ArrowRight" text @click="nextMonth" />
    </div>

    <!-- 星期标题 -->
    <div class="calendar-weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <!-- 日期网格 -->
    <div class="calendar-grid" ref="gridRef">
      <div
        v-for="(date, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'is-empty': !date,
          'is-today': isToday(date),
          'has-memo': hasMemo(date),
          'is-other-month': isOtherMonth(date),
          'is-past': isPast(date) && !hasMemo(date),
          'is-clickable': canClick(date),
          'is-sunday': date?.getDay() === 0
        }"
        @click="onDayClick(date)"
      >
        <span v-if="date" class="day-number">{{ date.getDate() }}</span>
        <el-icon v-if="date && hasMemo(date) && date.getDay() !== 0" class="memo-icon"><Memo /></el-icon>
        <el-icon v-if="date && hasMemo(date) && date.getDay() === 0" class="memo-icon sunday-icon"><Folder /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Memo, Folder } from '@element-plus/icons-vue'
import { useMemoStore } from '../stores/memo'

const router = useRouter()
const store = useMemoStore()
const gridRef = ref<HTMLElement | null>(null)

const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 获取日历日期数组（包含空白填充）
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 获取月第一天是周几（0=周日，1=周一...），转换为周一开始
  let startWeekday = firstDay.getDay()
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1

  const days: (Date | null)[] = []

  // 填充上月日期空白
  for (let i = 0; i < startWeekday; i++) {
    days.push(null)
  }

  // 填充当月日期
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  // 补齐最后一行空白
  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
})

// 检查是否有记事本
function hasMemo(date: Date | null): boolean {
  if (!date) return false
  // 周日的记事本图标在周日格子上显示本周一到周五的所有记事本
  if (date.getDay() === 0) {
    return hasWeekdayMemos(date)
  }
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return store.memos.some(m => {
    const d = new Date(m.created_at)
    const memoDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return memoDateStr === dateStr
  })
}

// 检查一周中周一到周五是否有记事本（用于周日格子显示）
function hasWeekdayMemos(date: Date | null): boolean {
  if (!date) return false
  // 找到这周的周一和周日
  const day = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return store.memos.some(m => {
    const d = new Date(m.created_at)
    return d >= monday && d <= sunday && d.getDay() >= 1 && d.getDay() <= 5
  })
}

function isToday(date: Date | null): boolean {
  if (!date) return false
  const today = new Date()
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
}

function isOtherMonth(date: Date | null): boolean {
  if (!date) return true
  return date.getMonth() !== currentMonth.value
}

function isPast(date: Date | null): boolean {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

function canClick(date: Date | null): boolean {
  if (!date) return false
  // 周日只有当本周一到周五存在记事本时才可点击
  if (date.getDay() === 0) return hasWeekdayMemos(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  // 未来日期或今天或有记事本的日期可以点击
  return checkDate >= today || hasMemo(date)
}

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

function onDayClick(date: Date | null) {
  if (!date || !canClick(date)) return

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  // 周日跳转到周汇总页面，其他日期跳转到日期记事本页面
  if (date.getDay() === 0) {
    router.push({ path: '/week', query: { date: dateStr } })
  } else {
    router.push({ path: '/day', query: { date: dateStr } })
  }
}
</script>

<style scoped>
.custom-calendar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
}

.calendar-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--color-bg-page);
  border-bottom: 1px solid var(--color-border-light);
}

.weekday {
  padding: 12px 8px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.calendar-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 80px;
  overflow-y: auto;
}

.calendar-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  transition: background 0.15s;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day.is-clickable {
  cursor: pointer;
}

.calendar-day.is-clickable:hover {
  background: var(--color-secondary-light);
}

.calendar-day.is-past {
  cursor: not-allowed;
}

.calendar-day.is-past .day-number {
  color: var(--color-text-disabled);
}

.calendar-day.has-memo:not(.is-past) {
  background: rgba(255, 103, 0, 0.05);
}

.calendar-day.is-past .day-number {
  color: var(--color-text-disabled);
}

.calendar-day.is-empty {
  cursor: default;
}

.calendar-day.is-other-month .day-number {
  color: var(--color-text-disabled);
}

.calendar-day.is-today .day-number {
  background: var(--color-primary);
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-number {
  font-size: 14px;
  color: var(--color-text-primary);
}

.memo-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  color: var(--color-primary);
}

.sunday-icon {
  color: #9c27b0;
}

.calendar-day.is-sunday.has-memo {
  background: rgba(156, 39, 176, 0.1);
}

.calendar-day.is-sunday.has-memo.is-clickable {
  cursor: pointer;
}

.calendar-day.is-sunday.has-memo.is-clickable:hover {
  background: rgba(156, 39, 176, 0.2);
}

.calendar-day.is-sunday.has-memo .day-number {
  color: #9c27b0;
  font-weight: 600;
}
</style>
