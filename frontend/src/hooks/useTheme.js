// File: src/hooks/useTheme.js
// Purpose: Light / dark theme. 'system' follows the device setting; the choice is saved.
// Used by: App.jsx, components/layout/ThemeToggle.jsx
//
// The theme is applied as <html data-theme="light|dark">; styles/tokens.css swaps the colours.
import { useEffect, useState } from 'react';
import useLocalStorage from './useLocalStorage';
import { STORAGE_KEYS } from '../data/constants';

const darkQuery = () => window.matchMedia?.('(prefers-color-scheme: dark)');

export default function useTheme() {
  const [preference, setPreference] = useLocalStorage(STORAGE_KEYS.THEME, 'system'); // 'system' | 'light' | 'dark'
  const [systemDark, setSystemDark] = useState(() => Boolean(darkQuery()?.matches));

  // Re-check when the device switches between light and dark
  useEffect(() => {
    const query = darkQuery();
    if (!query) return undefined;
    const handleChange = (event) => setSystemDark(event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return { theme, preference, setPreference };
}
