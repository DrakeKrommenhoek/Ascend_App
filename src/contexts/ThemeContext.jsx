import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isPremiumTheme, setIsPremiumTheme] = useState(false)

  function applyTheme(premium) {
    document.body.classList.add('theme-transitioning')
    if (premium) {
      document.body.classList.add('premium')
    } else {
      document.body.classList.remove('premium')
    }
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 700)
  }

  // Sync from user profile when provided externally (called by AuthContext after load)
  function syncFromUser(user) {
    if (user?.isPremiumTheme !== undefined) {
      setIsPremiumTheme(user.isPremiumTheme)
      applyTheme(user.isPremiumTheme)
    }
  }

  async function toggleTheme(user) {
    const next = !isPremiumTheme
    setIsPremiumTheme(next)
    applyTheme(next)

    // Persist to KV if user is authenticated
    if (user) {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPremiumTheme: next }),
      })
    }
  }

  return (
    <ThemeContext.Provider value={{ isPremiumTheme, toggleTheme, syncFromUser }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
