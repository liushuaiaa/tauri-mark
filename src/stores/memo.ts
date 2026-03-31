import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export interface Memo {
  id: string
  title: string
  content: string
  created_at: number
  updated_at: number
  deleted_at: number | null
  encrypted: boolean
  password_hint: string | null
}

export const useMemoStore = defineStore('memo', () => {
  const memos = ref<Memo[]>([])
  const loading = ref(false)

  async function fetchMemos() {
    loading.value = true
    try {
      memos.value = await invoke<Memo[]>('get_memos')
      // Filter out trashed memos and sort by updated_at descending
      memos.value = memos.value.filter(m => !m.deleted_at)
      memos.value.sort((a, b) => b.updated_at - a.updated_at)
    } finally {
      loading.value = false
    }
  }

  async function saveMemo(memo: Memo) {
    await invoke('save_memo', { memo })
    await fetchMemos()
  }

  // Soft delete - move to trash
  async function trashMemo(id: string) {
    await invoke('trash_memo', { id })
    await fetchMemos()
  }

  // Legacy delete - now calls trashMemo for backward compatibility
  async function deleteMemo(id: string) {
    await invoke('delete_memo', { id })
    await fetchMemos()
  }

  function getMemosByDate(date: Date): Memo[] {
    return memos.value.filter(m => {
      const d = new Date(m.updated_at)
      return d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
    })
  }

  return { memos, loading, fetchMemos, saveMemo, trashMemo, deleteMemo, getMemosByDate }
})
