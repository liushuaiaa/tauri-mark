import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export interface Memo {
  id: string
  title: string
  content: string
  created_at: number
  updated_at: number
}

export const useMemoStore = defineStore('memo', () => {
  const memos = ref<Memo[]>([])
  const loading = ref(false)

  async function fetchMemos() {
    loading.value = true
    try {
      memos.value = await invoke<Memo[]>('get_memos')
      memos.value.sort((a, b) => b.updated_at - a.updated_at)
    } finally {
      loading.value = false
    }
  }

  async function saveMemo(memo: Memo) {
    await invoke('save_memo', { memo })
    await fetchMemos()
  }

  async function deleteMemo(id: string) {
    await invoke('delete_memo', { id })
    await fetchMemos()
  }

  return { memos, loading, fetchMemos, saveMemo, deleteMemo }
})
