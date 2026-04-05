<template>
  <CommonDialog
    v-model="visible"
    title="导入内容"
    width="600px"
    @close="handleClose"
  >
    <div class="import-preview" v-html="content"></div>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认导入</el-button>
    </template>
  </CommonDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  content: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [content: string]
  'cancel': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function handleConfirm() {
  emit('confirm', props.content)
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.import-preview {
  word-break: break-all;
}

.import-preview :deep(p) {
  margin-bottom: 12px;
}

.import-preview :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
