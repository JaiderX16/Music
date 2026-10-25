import { useCallback, useEffect, useState } from 'react';

/**
 * Memoria Spot UI — light/dark theme hook (React).
 *
 * Backed by the `dark` class on <html>. The initial value is whatever
 * assets/theme-prepaint.html applied before first paint; an explicit choice is
 * persisted under "memoria-theme", and until then the OS preference keeps
 * being followed. Wire the toggle to a .pill-btn (Sun in dark, Moon in light).
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'memoria-theme';
const THEME_COLOR: Record<Theme, string> = { light: '#c8c8cd', dark: '#0a0a0c' };

function readTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage blocked: just follow the OS
    }
    if (saved === 'light' || saved === 'dark') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return; // the user chose explicitly since mount
      } catch {
        // storage blocked: keep following the OS
      }
      const next: Theme = e.matches ? 'light' : 'dark';
      applyTheme(next);
      setThemeState(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked: the choice lasts for this session only
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => setTheme(readTheme() === 'dark' ? 'light' : 'dark'), [setTheme]);

  return { theme, setTheme, toggleTheme };
}
