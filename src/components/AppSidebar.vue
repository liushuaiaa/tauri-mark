<template>
  <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
    <div class="sidebar-header" v-if="!sidebarCollapsed">
      <span class="logo-text">{{ currentTitle }}</span>
      <el-button
        :icon="SwitchButton"
        text
        @click="handleLogout"
        class="logout-btn"
        title="退出登录"
      />
    </div>

    <nav class="nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 'icon-only': sidebarCollapsed && !item.hideWhenCollapsed }"
        v-show="!(sidebarCollapsed && item.hideWhenCollapsed)"
        @click="navigate"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
        <ElBadge
          v-if="item.showBadge && !sidebarCollapsed && trashCount > 0"
          :value="trashCount"
          class="trash-badge"
        />
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <el-button :icon="Burger" text @click="toggle" class="toggle-btn" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Burger,
  Calendar,
  Delete,
  Memo,
  Setting,
  SwitchButton,
  Grid,
} from '@element-plus/icons-vue'
import { ElBadge, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { sidebarCollapsed } from '../stores/sidebar'
import { useTrashStore } from '../stores/trash'
import { isLoggedIn, logout } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const trashStore = useTrashStore()

const trashCount = computed(() => trashStore.trashedMemos.length)

const navItems = [
  { path: '/', name: '记事本', icon: markRaw(Memo) },
  { path: '/calendar', name: '日历', icon: markRaw(Calendar) },
  { path: '/trash', name: '回收站', icon: markRaw(Delete), showBadge: true },
  { path: '/pet', name: '宠物', icon: markRaw(Grid) },
  { path: '/settings', name: '设置', icon: markRaw(Setting), hideWhenCollapsed: true },
]

const routeTitleMap: Record<string, string> = {
  '/': '记事本',
  '/calendar': '日历',
  '/trash': '回收站',
  '/pet': '宠物',
  '/settings': '设置',
}

const currentTitle = computed(() => routeTitleMap[route.path] || '记事本')

onMounted(() => {
  if (isLoggedIn.value) {
    trashStore.fetchTrashed()
  }
})

function toggle() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function navigate() {
  sidebarCollapsed.value = true
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100%;
  background: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
}
.sidebar.collapsed {
  width: 60px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);
  min-height: 60px;
}
.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}
.logout-btn {
  font-size: 16px;
  color: var(--color-text-secondary);
}
.logout-btn:hover {
  color: var(--color-primary);
}
.nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  white-space: nowrap;
}
.nav-item.icon-only {
  justify-content: center;
  padding: 10px;
}
.nav-item:hover {
  background: var(--color-secondary-light);
  color: var(--color-primary);
}
.nav-item.router-link-active {
  background: var(--color-secondary-light);
  color: var(--color-primary);
}
.trash-badge {
  margin-left: auto;
}
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: center;
}
.toggle-btn {
  font-size: 18px;
  width: 100%;
  color: var(--color-text-secondary);
}
.toggle-btn:hover {
  color: var(--color-primary);
}
.sidebar.collapsed .toggle-btn {
  width: 44px;
}
</style>
