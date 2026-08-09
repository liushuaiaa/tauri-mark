<template>
  <CommonDialog v-model="visible" :title="isEdit ? '编辑反馈' : '提交反馈'" width="560px">
    <div class="form">
      <div class="form-item">
        <label class="form-label">标题</label>
        <ElInput v-model="form.title" placeholder="请输入反馈标题" maxlength="100" />
      </div>
      <div class="form-item">
        <label class="form-label">内容</label>
        <ElInput
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="请详细描述您的反馈内容..."
          maxlength="2000"
          show-word-limit
        />
      </div>
    </div>
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleConfirm">提交</ElButton>
    </template>
  </CommonDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElInput } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  feedback?: { title: string; content: string } | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm', data: { title: string; content: string }): void
}>()

const visible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const form = ref({ title: '', content: '' })

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    isEdit.value = !!props.feedback
    form.value = {
      title: props.feedback?.title || '',
      content: props.feedback?.content || ''
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function handleConfirm() {
  if (!form.value.title.trim()) return
  submitting.value = true
  try {
    emit('confirm', { ...form.value })
    visible.value = false
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
}
</style>
