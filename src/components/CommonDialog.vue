<template>
  <el-dialog
    v-model="visible"
    :width="width"
    :show-close="false"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">{{ title }}</span>
        <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
      </div>
    </template>
    <div class="dialog-content">
      <slot></slot>
    </div>
    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  width?: string
}>(), {
  title: '',
  width: '500px'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function handleClose() {
  emit('close')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-icon {
  position: absolute;
  right: 0;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-text-secondary);
}

.close-icon:hover {
  color: var(--color-text-primary);
}

.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  background: var(--color-bg-page);
  border-radius: 4px;
  line-height: 1.6;
}

:deep(.el-dialog) {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 0;
}

:deep(.el-dialog__body) {
  padding: 0 20px 20px;
}

:deep(.el-dialog__footer) {
  text-align: right;
}
</style>
