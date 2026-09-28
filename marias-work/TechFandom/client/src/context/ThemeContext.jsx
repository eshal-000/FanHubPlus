
/* oxlint-disable react/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const ThemeContext = createContext(null);

function readPreference(key, fallback) {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    readPreference('fanHubPlusTheme', 'dark')
  );

  const [fontScale, setFontScale] = useState(() =>
    readPreference('fanHubPlusFontScale', 'normal')
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('fanHubPlusTheme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
    window.localStorage.setItem('fanHubPlusFontScale', fontScale);
  }, [fontScale]);

  const value = useMemo(
    () => ({
      theme,
      fontScale,
      toggleTheme: () =>
        setTheme((current) =>
          current === 'dark' ? 'light' : 'dark'
        ),
      setFontScale,
    }),
    [theme, fontScale]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider'
    );
  }

  return context;
}
