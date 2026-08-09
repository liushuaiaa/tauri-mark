import { defineStore } from 'pinia'
import { ref } from 'vue'
import { feedbackApi } from '../api/feedback'
import type { Feedback } from '../api/type/feedback'

export const useFeedbackStore = defineStore('feedback', () => {
  const feedbacks = ref<Feedback[]>([])
  const loading = ref(false)

  async function fetchFeedbacks() {
    loading.value = true
    try {
      const response = await feedbackApi.list()
      if (response.code === 200) {
        feedbacks.value = response.data
      }
    } finally {
      loading.value = false
    }
  }

  async function addFeedback(data: Partial<Feedback>) {
    await feedbackApi.add(data)
    await fetchFeedbacks()
  }

  async function editFeedback(data: Partial<Feedback>) {
    await feedbackApi.edit(data)
    await fetchFeedbacks()
  }

  async function deleteFeedback(id: number) {
    await feedbackApi.delete(id)
    await fetchFeedbacks()
  }

  return {
    feedbacks,
    loading,
    fetchFeedbacks,
    addFeedback,
    editFeedback,
    deleteFeedback
  }
})
