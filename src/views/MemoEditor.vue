<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMemoStore, type Memo } from '../stores/memo'
import { ElButton, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

const store = useMemoStore()
const route = useRoute()
const router = useRouter()

const id = ref('')
const title = ref('')
const content = ref('')
const saving = ref(false)

onMounted(async () => {
  const memoId = route.params.id as string
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

<template>
  <div class="memo-editor">
    <div class="header">
      <ElButton :icon="ArrowLeft" @click="router.back()">返回</ElButton>
      <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
    </div>

    <ElForm class="form">
      <ElFormItem label="标题">
        <ElInput v-model="title" placeholder="请输入标题" maxlength="100" show-word-limit />
      </ElFormItem>
      <ElFormItem label="内容">
        <ElInput v-model="content" type="textarea" placeholder="请输入内容" :rows="15" resize="vertical" />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped>
.memo-editor {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.form {
  margin-top: 10px;
}
</style>
