import { ref } from 'vue'

export function useSavedFeedback(duration = 3000) {
  const saved = ref(false)

  function markSaved() {
    saved.value = true
    setTimeout(() => (saved.value = false), duration)
  }

  return { saved, markSaved }
}
