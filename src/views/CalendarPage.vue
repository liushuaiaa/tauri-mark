<template>
  <div class="calendar-page">
    <CustomCalendar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import CustomCalendar from '../components/CustomCalendar.vue'
import { useMemoStore } from '../stores/memo'

const store = useMemoStore()

onMounted(() => {
  store.fetchMemos()
})
</script>

<style scoped>
.calendar-page {
  height: 100%;
  padding: 24px;
}
</style>
