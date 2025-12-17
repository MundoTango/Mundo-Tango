import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Standalone theme hook - uses same localStorage key as ThemeProvider for consistency
 * Prefer using ThemeProvider context instead when possible
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Use same localStorage key as ThemeProvider
    const stored = localStorage.getItem("mundo-tango-dark-mode");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    // Use same localStorage key as ThemeProvider
    localStorage.setItem("mundo-tango-dark-mode", theme);
  }, [theme]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mundo-tango-dark-mode' && e.newValue) {
        if (e.newValue === 'light' || e.newValue === 'dark') {
          setThemeState(e.newValue);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
}
