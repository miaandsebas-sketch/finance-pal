// hub integration — shared pattern across all pal apps
import { useEffect } from 'react'

export function useHubSync({ themeColor, setDark, onGoHome }) {
  useEffect(() => {
    function onMessage(e) {
      if (e.data?.type === 'app:goHome') onGoHome?.()
      if (e.data?.type === 'hub:theme') {
        const isDark = e.data.theme === 'dark'
        setDark(isDark)
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('ms-theme', e.data.theme)
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) meta.content = isDark ? '#1a1713' : themeColor
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
