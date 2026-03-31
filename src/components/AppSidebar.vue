<template>
  <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
    <div class="sidebar-header" v-if="!sidebarCollapsed">
      <span class="logo-text">备忘录</span>
    </div>

    <nav class="nav">
      <router-link to="/" class="nav-item" :class="{ 'icon-only': sidebarCollapsed }" @click="navigate">
        <el-icon><Memo /></el-icon>
        <span v-if="!sidebarCollapsed">备忘录</span>
      </router-link>
      <router-link to="/calendar" class="nav-item" :class="{ 'icon-only': sidebarCollapsed }" @click="navigate">
        <el-icon><Calendar /></el-icon>
        <span v-if="!sidebarCollapsed">日历</span>
      </router-link>
      <router-link to="/trash" class="nav-item" :class="{ 'icon-only': sidebarCollapsed }" @click="navigate">
        <el-icon><Delete /></el-icon>
        <span v-if="!sidebarCollapsed">回收站</span>
        <ElBadge v-if="!sidebarCollapsed && trashCount > 0" :value="trashCount" class="trash-badge" />
      </router-link>
      <router-link v-if="!sidebarCollapsed" to="/settings" class="nav-item" @click="navigate">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <el-button :icon="Burger" text @click="toggle" class="toggle-btn" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Burger, Calendar, Delete, Memo, Setting } from '@element-plus/icons-vue'
import { ElBadge, ElButton } from 'element-plus'
import { sidebarCollapsed } from '../stores/sidebar'
import { useTrashStore } from '../stores/trash'

const trashStore = useTrashStore()

const trashCount = computed(() => trashStore.trashedMemos.length)

onMounted(() => {
  trashStore.fetchTrashed()
})

function toggle() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function navigate() {
  sidebarCollapsed.value = true
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
