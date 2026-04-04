import { defineStore } from 'pinia'
import { ref } from 'vue'
import { memoApi, type Memo } from '../api/memo'

export { type Memo }

export const useMemoStore = defineStore('memo', () => {
  const memos = ref<Memo[]>([])
  const loading = ref(false)

  async function fetchMemos() {
    loading.value = true
    try {
      const response = await memoApi.getMemos()
      if (response.code === 200) {
        memos.value = response.data
        memos.value.sort((a, b) => b.updated_at - a.updated_at)
      }
    } finally {
      loading.value = false
    }
  }

  async function saveMemo(memo: Memo) {
    if (memo.id) {
      await memoApi.updateMemo(memo.id, memo)
    } else {
      await memoApi.createMemo(memo)
    }
    await fetchMemos()
  }

  async function trashMemo(id: string) {
    await memoApi.deleteMemo(id)
    await fetchMemos()
  }

  async function deleteMemo(id: string) {
    await memoApi.permanentDeleteMemo(id)
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
