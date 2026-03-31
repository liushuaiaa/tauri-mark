<template>
  <div class="title-bar">
    <div class="title-bar-title" @mousedown="startDrag">
      <div class="title-left">
        <span class="title-text">备忘录</span>
        <span v-if="loading" class="weather-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
        </span>
        <span v-else-if="weather" class="weather-info">
          <span class="weather-icon">{{ weather.icon }}</span>
          <span class="weather-temp">{{ weather.temperature }}°C</span>
          <span class="weather-location">{{ weather.location }}</span>
        </span>
      </div>
      <el-switch v-model="cursorEnabled" size="small" @mousedown.stop @click.stop />
    </div>
    <div class="title-bar-controls">
      <button class="control-btn minimize" @click="handleMinimize" title="最小化">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="5.5" width="8" height="1" fill="currentColor"/>
        </svg>
      </button>
      <button class="control-btn maximize" @click="handleMaximize" title="最大化">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
      <button class="control-btn close" @click="handleClose" title="关闭">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { cursorEnabled } from '../stores/cursor'
import { useWeatherStore } from '../stores/weather'
import { storeToRefs } from 'pinia'
import { Loading } from '@element-plus/icons-vue'

const appWindow = getCurrentWindow()
const weatherStore = useWeatherStore()
const { weather, loading } = storeToRefs(weatherStore)

onMounted(() => {
  weatherStore.fetchWeather()
})

async function startDrag() {
  await appWindow.startDragging()
}

async function handleMinimize() {
  await appWindow.minimize()
}

async function handleMaximize() {
  const isMaximized = await appWindow.isMaximized()
  if (isMaximized) {
    await appWindow.unmaximize()
  } else {
    await appWindow.maximize()
  }
}

async function handleClose() {
  await appWindow.close()
}
</script>

<style scoped>
.title-bar {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: #fff;
  user-select: none;
  -webkit-user-select: none;
  flex-shrink: 0;
}

.title-bar-title {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: grab;
}

.title-bar-title:active {
  cursor: grabbing;
}

.title-bar-title :deep(.el-switch) {
  --el-switch-off-color: rgba(255, 255, 255, 0.3);
  --el-switch-on-color: var(--color-secondary);
}

.title-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-text {
  flex-shrink: 0;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}

.weather-loading {
  display: flex;
  align-items: center;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.weather-icon {
  font-size: 14px;
}

.weather-temp {
  font-weight: 500;
}

.weather-location {
  opacity: 0.7;
}

.title-bar-controls {
  display: flex;
  height: 100%;
  cursor: default;
}

.control-btn {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.15s;
}

.control-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.control-btn.close:hover {
  background-color: #e81123;
}

.control-btn:active {
  background-color: rgba(255, 255, 255, 0.3);
}

.control-btn.close:active {
  background-color: #c41018;
}
</style>
