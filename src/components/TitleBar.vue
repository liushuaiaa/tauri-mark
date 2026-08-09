<template>
  <div class="title-bar">
    <div class="title-bar-title" @mousedown="startDrag">
      <div class="title-left">
        <el-dropdown
          v-if="isLoggedIn"
          trigger="hover"
          @command="handleUserCommand"
          class="user-dropdown"
        >
          <span class="title-text">记事本</span>
          <template #dropdown>
            <el-dropdown-menu class="user-dropdown-menu">
              <div class="dropdown-user-info">
                <el-icon><User /></el-icon>
                <span class="dropdown-username">{{ currentUsername }}</span>
              </div>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span v-else class="title-text">记事本</span>
        <span v-if="showWeather && loading" class="weather-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
        </span>
        <span v-else-if="showWeather && weather" class="weather-info">
          <span class="weather-icon">{{ weather.icon }}</span>
          <span class="weather-temp">{{ weather.temperature }}°C</span>
          <span class="weather-location">{{ weather.location }}</span>
        </span>
      </div>
      <el-switch
        v-if="showCursorSwitch"
        v-model="cursorEnabled"
        size="small"
        @mousedown.stop
        @click.stop
      />
    </div>
    <div class="title-bar-controls">
      <button
        v-if="showMinimize"
        class="control-btn minimize"
        @click="handleMinimize"
        title="最小化"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="5.5" width="8" height="1" fill="currentColor" />
        </svg>
      </button>
      <button
        v-if="showMaximize"
        class="control-btn maximize"
        @click="handleMaximize"
        title="最大化"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect
            x="2"
            y="2"
            width="8"
            height="8"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
          />
        </svg>
      </button>
      <button
        v-if="showClose"
        class="control-btn close"
        @click="handleClose"
        title="关闭"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M2 2L10 10M10 2L2 10"
            stroke="currentColor"
            stroke-width="1.2"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { cursorEnabled } from '../stores/cursor'
import { useWeatherStore } from '../stores/weather'
import { isLoggedIn, currentUsername, logout } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { Loading, User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Props {
  showWeather?: boolean
  showCursorSwitch?: boolean
  showMinimize?: boolean
  showMaximize?: boolean
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showWeather: true,
  showCursorSwitch: true,
  showMinimize: true,
  showMaximize: true,
  showClose: true,
})

const appWindow = getCurrentWindow()
const router = useRouter()
const weatherStore = useWeatherStore()
const { weather, loading } = storeToRefs(weatherStore)

function handleUserCommand(command: string) {
  if (command === 'logout') {
    logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}

onMounted(() => {
  if (props.showWeather) {
    weatherStore.fetchWeather()
  }
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
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-dark) 100%
  );
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

.user-dropdown {
  flex-shrink: 0;
  cursor: pointer;
  color: #fff;
}
.user-dropdown:focus,
.user-dropdown:focus-visible,
.user-dropdown:focus-within,
.user-dropdown:hover {
  outline: none;
}
/* el-dropdown 内部可聚焦触发器（span.title-text 带 tabindex）被浏览器绘制默认 focus 环，一并屏蔽 */
.user-dropdown :deep(*) {
  outline: none !important;
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.dropdown-username {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
