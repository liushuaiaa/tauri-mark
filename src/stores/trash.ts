import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Memo } from './memo'

export const useTrashStore = defineStore('trash', () => {
  const trashedMemos = ref<Memo[]>([])
  const loading = ref(false)

  async function fetchTrashed() {
    loading.value = true
    try {
      trashedMemos.value = await invoke<Memo[]>('get_trashed_memos')
      trashedMemos.value.sort((a, b) => (b.deleted_at || 0) - (a.deleted_at || 0))
    } finally {
      loading.value = false
    }
  }

  async function restoreMemo(id: string) {
    await invoke('restore_memo', { id })
    await fetchTrashed()
  }

  async function permanentDelete(id: string) {
    await invoke('permanent_delete_memo', { id })
    await fetchTrashed()
  }

  async function emptyTrash() {
    await invoke('empty_trash')
    await fetchTrashed()
  }

  async function cleanupTrash(days: number) {
    await invoke('cleanup_trash', { days })
    await fetchTrashed()
  }

  return {
    trashedMemos,
    loading,
    fetchTrashed,
    restoreMemo,
    permanentDelete,
    emptyTrash,
    cleanupTrash
  }
})
