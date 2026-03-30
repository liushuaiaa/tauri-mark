<template>
  <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
    <div class="sidebar-header">
      <span v-if="!sidebarCollapsed" class="logo-text">备忘录</span>
      <el-button :icon="Burger" text @click="toggle" class="toggle-btn" />
    </div>

    <nav v-if="!sidebarCollapsed" class="nav">
      <router-link to="/" class="nav-item" @click="navigate">
        <el-icon><Memo /></el-icon>
        <span>备忘录</span>
      </router-link>
      <router-link to="/calendar" class="nav-item" @click="navigate">
        <el-icon><Calendar /></el-icon>
        <span>日历</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { Burger, Calendar, Memo } from '@element-plus/icons-vue'
import { sidebarCollapsed } from '../stores/sidebar'

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
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}
.sidebar.collapsed {
  width: 60px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 60px;
}
.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}
.toggle-btn {
  font-size: 18px;
}
.nav {
  padding: 12px 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}
.nav-item:hover,
.nav-item.router-link-active {
  background: #f5f7fa;
  color: #409eff;
}
</style>
