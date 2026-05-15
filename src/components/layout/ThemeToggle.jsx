import { useUiStore } from '@/store/uiStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useUiStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-ocv-cyan"
      style={{ background: isDark ? 'rgba(0,172,209,0.25)' : 'rgba(255,220,0,0.3)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs"
        style={{
          transform:  isDark ? 'translateX(0)' : 'translateX(24px)',
          background: isDark ? '#00aad1' : '#ffdc00',
          boxShadow:  isDark ? '0 0 8px rgba(0,172,209,0.7)' : '0 0 8px rgba(255,220,0,0.7)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
