<template>
  <div class="memo-editor">
    <div class="header">
      <ElButton :icon="ArrowLeft" @click="router.back()">返回</ElButton>
      <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
    </div>

    <div class="form">
      <ElFormItem label="标题">
        <ElInput v-model="title" placeholder="请输入标题" maxlength="100" show-word-limit />
      </ElFormItem>
      <ElFormItem label="内容">
        <div class="editor-wrapper">
          <QuillEditor
            v-model:content="content"
            content-type="html"
            theme="snow"
            toolbar="essential"
            placeholder="请输入内容"
          />
        </div>
      </ElFormItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMemoStore, type Memo } from '../stores/memo'
import { ElButton, ElFormItem, ElInput, ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const store = useMemoStore()
const route = useRoute()
const router = useRouter()

const id = ref('')
const title = ref('')
const content = ref('')
const saving = ref(false)

onMounted(async () => {
  const memoId = route.params.id as string
  const dateParam = route.query.date as string

  if (memoId) {
    id.value = memoId
    const memo = store.memos.find(m => m.id === memoId)
    if (memo) {
      title.value = memo.title
      content.value = memo.content
    } else {
      await store.fetchMemos()
      const fresh = store.memos.find(m => m.id === memoId)
      if (fresh) {
        title.value = fresh.title
        content.value = fresh.content
      }
    }
  } else if (dateParam) {
    title.value = `${dateParam} 备忘录`
  }
})

async function handleSave() {
  if (!title.value.trim() && !content.value.trim()) {
    ElMessage.warning('请输入标题或内容')
    return
  }
  saving.value = true
  try {
    const now = Date.now()
    const memo: Memo = {
      id: id.value || crypto.randomUUID(),
      title: title.value.trim(),
      content: content.value,
      created_at: id.value ? (store.memos.find(m => m.id === id.value)?.created_at ?? now) : now,
      updated_at: now
    }
    await store.saveMemo(memo)
    ElMessage.success('保存成功')
    router.push('/')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.memo-editor {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.editor-wrapper {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}
:deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  padding: 8px;
}
:deep(.ql-container.ql-snow) {
  border: none;
  min-height: 400px;
  font-size: 16px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}
:deep(.ql-editor) {
  min-height: 400px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}
:deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: var(--color-text-disabled);
}
:deep(.ql-snow .ql-stroke) {
  stroke: var(--color-text-secondary);
}
:deep(.ql-snow .ql-fill) {
  fill: var(--color-text-secondary);
}
:deep(.ql-snow .ql-picker) {
  color: var(--color-text-secondary);
}
</style>
