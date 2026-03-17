import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const THEMES: Theme[] = ['light', 'dark', 'system']

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme): void {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.setAttribute('data-theme', resolved)
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system')

  applyTheme(theme.value)

  watch(theme, (value) => {
    localStorage.setItem('theme', value)
    applyTheme(value)
  })

  function cycle(): void {
    const current = THEMES.indexOf(theme.value)
    theme.value = THEMES[(current + 1) % THEMES.length]
  }

  function set(value: Theme): void {
    theme.value = value
  }

  return { theme, cycle, set }
})
