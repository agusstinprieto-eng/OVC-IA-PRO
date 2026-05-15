import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUiStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),
      initTheme: () =>
        set((s) => {
          document.documentElement.classList.toggle('dark', s.theme === 'dark')
          return {}
        }),
    }),
    { name: 'ocv-ui-theme' }
  )
)
