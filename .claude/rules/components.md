---
paths:
  - "src/views/**/*"
  - "src/components/**/*"
---

# 公共组件清单

## 组件列表

| 组件 | 路径 | 说明 |
|------|------|------|
| `CommonDialog.vue` | `src/components/` | 全局弹窗，固定居中，内容滚动 |
| `CustomCalendar.vue` | `src/components/` | 日历，支持日期跳转和备忘录图标 |
| `AppSidebar.vue` | `src/components/` | 侧边栏导航 |
| `TitleBar.vue` | `src/components/` | 自定义标题栏 |

## 组件使用规则

**写页面时必须先检查公共组件：**

1. **创建新页面之前**：先查看 `src/components/` 是否有可复用的组件
2. **优先使用**：有相同功能的组件时，必须使用公共组件而非重新实现
3. **封装时机**：多个页面有相同功能时，应提取为公共组件

## 弹窗抽离规则

**页面中的弹窗必须抽离为独立 Vue 文件：**
- 所有弹窗均需抽离为独立组件，放在 `src/components/` 目录
- 弹窗命名以 `Dialog` 结尾
- 使用 `v-model` 控制显示，`defineEmits` 暴露确认事件

## 公共组件详情

### CommonDialog
全局弹窗，已在 `main.ts` 注册为全局组件：
```vue
<CommonDialog v-model="visible" title="标题" width="600px">
  <!-- 内容 -->
  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <el-button type="primary">确认</el-button>
  </template>
</CommonDialog>
```
特性：固定居中、内容滚动(max-height: 60vh)、点击遮罩不关闭

### CustomCalendar
日历组件，支持日期点击跳转和备忘录图标标记
