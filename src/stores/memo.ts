import { defineStore } from 'pinia'
import { ref } from 'vue'
import { memoApi, type Memo } from '../api/memo'

export { type Memo }

export const useMemoStore = defineStore('memo', () => {
  const memos = ref<Memo[]>([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  async function fetchMemos(params?: {
    keyword?: string
    startDate?: number
    endDate?: number
    page?: number
  }) {
    loading.value = true
    try {
      const response = await memoApi.getMemos({
        keyword: params?.keyword,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page: params?.page || currentPage.value,
        pageSize: pageSize.value
      })
      if (response.code === 200) {
        memos.value = response.data.list
        total.value = response.data.total
        currentPage.value = response.data.page
      }
    } finally {
      loading.value = false
    }
  }

  async function loadMoreMemos(params?: {
    keyword?: string
    startDate?: number
    endDate?: number
  }) {
    if (memos.value.length >= total.value) return
    loading.value = true
    try {
      const nextPage = currentPage.value + 1
      const response = await memoApi.getMemos({
        keyword: params?.keyword,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page: nextPage,
        pageSize: pageSize.value
      })
      if (response.code === 200) {
        memos.value = [...memos.value, ...response.data.list]
        total.value = response.data.total
        currentPage.value = response.data.page
      }
    } finally {
      loading.value = false
    }
  }

  async function saveMemo(memo: Memo, isNew: boolean) {
    if (isNew) {
      await memoApi.createMemo(memo)
    } else {
      await memoApi.updateMemo(memo.id, memo)
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

  return { memos, loading, total, currentPage, pageSize, fetchMemos, loadMoreMemos, saveMemo, trashMemo, deleteMemo, getMemosByDate }
})
