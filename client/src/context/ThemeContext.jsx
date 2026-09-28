

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const FONT_SCALES = ['small', 'normal', 'large', 'xlarge']

function readPreference(key, fallback) {
  try {
    return window.localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readPreference('fanHubPlusTheme', 'dark'))
  const [fontScale, setFontScale] = useState(() => readPreference('fanHubPlusFontScale', 'normal'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem('fanHubPlusTheme', theme)
    } catch {

    }
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale
    try {
      window.localStorage.setItem('fanHubPlusFontScale', fontScale)
    } catch {

    }
  }, [fontScale])

  const value = useMemo(
    () => ({
      theme,
      fontScale,
      setTheme: (nextTheme) => setTheme(nextTheme === 'light' ? 'light' : 'dark'),
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      setFontScale: (scale) => {
        if (FONT_SCALES.includes(scale)) setFontScale(scale)
      },
      decreaseFontScale: () =>
        setFontScale((current) => {
          const index = FONT_SCALES.indexOf(current)
          return FONT_SCALES[Math.max(0, index - 1)]
        }),
      increaseFontScale: () =>
        setFontScale((current) => {
          const index = FONT_SCALES.indexOf(current)
          return FONT_SCALES[Math.min(FONT_SCALES.length - 1, index + 1)]
        }),
      resetFontScale: () => setFontScale('normal'),
    }),
    [fontScale, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
