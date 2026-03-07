import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAiStore = defineStore('ai', () => {
  const config = ref(null)
  const loading = ref(false)

  return { config, loading }
})
