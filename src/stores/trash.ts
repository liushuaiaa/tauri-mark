import { defineStore } from 'pinia'
import { ref } from 'vue'
import { memoApi, type Memo } from '../api/memo'

export const useTrashStore = defineStore('trash', () => {
  const trashedMemos = ref<Memo[]>([])
  const loading = ref(false)

  async function fetchTrashed() {
    loading.value = true
    try {
      const response = await memoApi.trash()
      if (response.code === 200) {
        trashedMemos.value = response.data
        trashedMemos.value.sort((a, b) => (b.deleted_at || 0) - (a.deleted_at || 0))
      }
    } finally {
      loading.value = false
    }
  }

  async function restoreMemo(id: string) {
    await memoApi.restore(id)
    await fetchTrashed()
  }

  async function permanentDelete(id: string) {
    await memoApi.permanentDelete(id)
    await fetchTrashed()
  }

  async function emptyTrash() {
    await memoApi.emptyTrash()
    await fetchTrashed()
  }

  async function cleanupTrash(days: number) {
    await memoApi.cleanupTrash(days)
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
