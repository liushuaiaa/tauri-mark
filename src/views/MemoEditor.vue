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
            ref="editorRef"
            v-model:content="content"
            content-type="html"
            theme="snow"
            :options="editorOptions"
            placeholder="请输入内容"
          />
        </div>
      </ElFormItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
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
const createdAt = ref(0) // 保存原始创建时间
const editorRef = ref<InstanceType<typeof QuillEditor> | null>(null)

const editorOptions = reactive({
  theme: 'snow',
  modules: {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['image']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }
})

function imageHandler() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    insertImage(file)
  }
  input.click()
}

function insertImage(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    insertImageByBase64(base64)
  }
  reader.readAsDataURL(file)
}

function insertImageByBase64(base64DataUrl: string) {
  const quill = editorRef.value?.getQuill()
  if (quill) {
    const range = quill.getSelection(true)
    quill.insertEmbed(range.index, 'image', base64DataUrl)
    quill.setSelection(range.index + 1)
  }
}

onMounted(async () => {
  const memoId = route.params.id as string
  const dateParam = route.query.date as string

  if (memoId) {
    id.value = memoId
    const memo = store.memos.find(m => m.id === memoId)
    if (memo) {
      title.value = memo.title
      content.value = memo.content
      createdAt.value = memo.created_at
    } else {
      await store.fetchMemos()
      const fresh = store.memos.find(m => m.id === memoId)
      if (fresh) {
        title.value = fresh.title
        content.value = fresh.content
        createdAt.value = fresh.created_at
      }
    }
  } else if (dateParam) {
    title.value = `${dateParam} 备忘录`
  }

  // 等待 Quill 初始化完成后设置拖拽
  await nextTick()
  await nextTick() // 双重等待确保 DOM 完全渲染
  setupDragAndDrop()
})

async function setupDragAndDrop() {
  console.log('Setting up Tauri drag and drop handlers')

  const qlEditor = document.querySelector('.ql-editor')
  if (!qlEditor) return

  // 监听 Tauri 的拖拽事件
  await listen('tauri://drag-enter', () => {
    console.log('Tauri drag-enter')
    qlEditor.classList.add('drag-over')
  })

  await listen('tauri://drag-over', () => {
    console.log('Tauri drag-over')
    qlEditor.classList.add('drag-over')
  })

  await listen('tauri://drag-leave', () => {
    console.log('Tauri drag-leave')
    qlEditor.classList.remove('drag-over')
  })

  await listen('tauri://drag-drop', async (event) => {
    console.log('Tauri drag-drop')
    qlEditor.classList.remove('drag-over')

    // 在 Tauri 中，拖拽的文件信息在 payload 中
    const payload = event.payload as { paths?: string[] }
    if (payload.paths && payload.paths.length > 0) {
      console.log('File paths:', payload.paths)
      for (const path of payload.paths) {
        // 使用 Tauri 命令读取文件并转为 base64
        try {
          const base64 = await invoke<string>('read_file_as_base64', { path })
          // 根据文件扩展名判断 MIME 类型
          const ext = path.split('.').pop()?.toLowerCase() || ''
          const mimeTypes: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            bmp: 'image/bmp'
          }
          const mimeType = mimeTypes[ext] || 'image/png'
          const dataUrl = `data:${mimeType};base64,${base64}`
          insertImageByBase64(dataUrl)
        } catch (e) {
          console.error('Failed to load file:', e)
        }
      }
    }
  })
}

async function handleSave() {
  if (!title.value.trim() && !content.value.trim()) {
    ElMessage.warning('请输入标题或内容')
    return
  }
  saving.value = true
  try {
    const now = Date.now()
    const isNew = !id.value
    const memo: Memo = {
      id: id.value || crypto.randomUUID(),
      title: title.value.trim(),
      content: content.value,
      created_at: createdAt.value || now,
      updated_at: now
    }
    if (isNew) {
      createdAt.value = memo.created_at
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
  font-family: 'HarmonyOS Sans', 'Microsoft YaHei', Arial, sans-serif;
}
:deep(.ql-editor) {
  min-height: 400px;
  font-family: 'HarmonyOS Sans', 'Microsoft YaHei', Arial, sans-serif;
}
:deep(.ql-editor img) {
  max-width: 100%;
  height: auto;
}
:deep(.ql-editor.drag-over) {
  background-color: var(--color-secondary-light);
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
