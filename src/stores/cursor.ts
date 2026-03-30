import { ref, watch } from 'vue'

const STORAGE_KEY = 'cursor-effect-enabled'

function getInitialValue(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return JSON.parse(stored)
    }
  } catch {}
  return true
}

export const cursorEnabled = ref(getInitialValue())

watch(cursorEnabled, (newVal) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  } catch {}
})
