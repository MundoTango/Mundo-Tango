/**
 * THEME CONTEXT PROVIDER
 * Provides visual theme and dark mode state to entire application
 * 
 * FEATURES:
 * - Automatic route-based theme detection
 * - Dark mode toggle with localStorage persistence
 * - CSS variable application for runtime theming
 * - System preference detection
 */

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { getThemeForRoute, type VisualTheme } from '@/config/theme-routes';
import { boldMinimaximalistTokens } from '@/config/tokens/semantic-bold';
import { mtOceanTokens } from '@/config/tokens/semantic-ocean';

export type DarkMode = 'light' | 'dark';

interface ThemeContextType {
  visualTheme: VisualTheme;
  darkMode: DarkMode;
  toggleDarkMode: () => void;
  setDarkMode: (mode: DarkMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [location] = useLocation();
  
  // Initialize dark mode from localStorage or system preference
  const [darkMode, setDarkModeState] = useState<DarkMode>(() => {
    const stored = localStorage.getItem('mundo-tango-dark-mode');
    if (stored === 'light' || stored === 'dark') return stored;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  // AUTO-DETECT VISUAL THEME BASED ON ROUTE
  const visualTheme: VisualTheme = useMemo(() => {
    return getThemeForRoute(location);
  }, [location]);
  
  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply dark mode class
    root.classList.toggle('dark', darkMode === 'dark');
    
    // Apply visual theme data attribute
    root.setAttribute('data-theme', visualTheme);
    
    // Apply CSS custom properties
    const tokens = visualTheme === 'bold-minimaximalist' 
      ? boldMinimaximalistTokens 
      : mtOceanTokens;
    
    applyCSSVariables(root, tokens, darkMode);
  }, [darkMode, visualTheme]);
  
  // Persist dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('mundo-tango-dark-mode', darkMode);
  }, [darkMode]);
  
  const toggleDarkMode = () => {
    setDarkModeState(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const setDarkMode = (mode: DarkMode) => {
    setDarkModeState(mode);
  };
  
  const value = {
    visualTheme,
    darkMode,
    toggleDarkMode,
    setDarkMode,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Apply CSS custom properties to root element
 */
function applyCSSVariables(
  root: HTMLElement, 
  tokens: typeof boldMinimaximalistTokens | typeof mtOceanTokens,
  darkMode: DarkMode
) {
  const isDark = darkMode === 'dark';
  
  // Colors
  root.style.setProperty('--color-primary', tokens.colorPrimary);
  root.style.setProperty('--color-secondary', tokens.colorSecondary);
  root.style.setProperty('--color-accent', tokens.colorAccent);
  root.style.setProperty('--color-primary-hover', tokens.colorPrimaryHover);
  root.style.setProperty('--color-secondary-hover', tokens.colorSecondaryHover);
  root.style.setProperty('--color-accent-hover', tokens.colorAccentHover);
  
  // Backgrounds
  root.style.setProperty('--color-background', isDark ? tokens.colorBackgroundDark : tokens.colorBackground);
  root.style.setProperty('--color-surface', isDark ? tokens.colorSurfaceDark : tokens.colorSurface);
  
  // Text
  root.style.setProperty('--color-text-primary', isDark ? tokens.colorTextPrimaryDark : tokens.colorTextPrimary);
  root.style.setProperty('--color-text-secondary', isDark ? tokens.colorTextSecondaryDark : tokens.colorTextSecondary);
  root.style.setProperty('--color-text-muted', isDark ? tokens.colorTextMutedDark : tokens.colorTextMuted);
  
  // Typography
  root.style.setProperty('--font-weight-heading', String(tokens.fontWeightHeading));
  root.style.setProperty('--font-weight-subheading', String(tokens.fontWeightSubheading));
  root.style.setProperty('--font-weight-body', String(tokens.fontWeightBody));
  root.style.setProperty('--font-weight-caption', String(tokens.fontWeightCaption));
  
  root.style.setProperty('--font-size-hero', tokens.fontSizeHero);
  root.style.setProperty('--font-size-h1', tokens.fontSizeH1);
  root.style.setProperty('--font-size-h2', tokens.fontSizeH2);
  root.style.setProperty('--font-size-h3', tokens.fontSizeH3);
  root.style.setProperty('--font-size-body', tokens.fontSizeBody);
  root.style.setProperty('--font-size-caption', tokens.fontSizeCaption);
  
  root.style.setProperty('--line-height-heading', tokens.lineHeightHeading);
  root.style.setProperty('--line-height-body', tokens.lineHeightBody);
  
  // Spacing
  root.style.setProperty('--spacing-base', tokens.spacingBase);
  root.style.setProperty('--spacing-card', tokens.spacingCard);
  root.style.setProperty('--spacing-section', tokens.spacingSection);
  root.style.setProperty('--spacing-page', tokens.spacingPage);
  
  // Border Radius
  root.style.setProperty('--radius-base', tokens.radiusBase);
  root.style.setProperty('--radius-card', tokens.radiusCard);
  root.style.setProperty('--radius-button', tokens.radiusButton);
  root.style.setProperty('--radius-input', tokens.radiusInput);
  
  // Shadows
  root.style.setProperty('--shadow-color', isDark ? tokens.shadowColorDark : tokens.shadowColor);
  root.style.setProperty('--shadow-small', tokens.shadowSmall);
  root.style.setProperty('--shadow-medium', tokens.shadowMedium);
  root.style.setProperty('--shadow-large', tokens.shadowLarge);
  root.style.setProperty('--shadow-xlarge', tokens.shadowXLarge);
  
  // Glassmorphic (MT Ocean only)
  if ('glassBackground' in tokens) {
    root.style.setProperty('--glass-background', isDark ? tokens.glassBackgroundDark : tokens.glassBackground);
    root.style.setProperty('--glass-backdrop-blur', tokens.glassBackdropBlur);
    root.style.setProperty('--glass-border', isDark ? tokens.glassBorderDark : tokens.glassBorder);
  }
  
  // Gradients
  root.style.setProperty('--gradient-primary', tokens.gradientPrimary);
  root.style.setProperty('--gradient-hero', tokens.gradientHero);
  root.style.setProperty('--gradient-accent', tokens.gradientAccent);
  
  // Animations
  root.style.setProperty('--transition-speed', tokens.transitionSpeed);
  root.style.setProperty('--transition-speed-slow', tokens.transitionSpeedSlow);
  root.style.setProperty('--animation-curve', tokens.animationCurve);
  
  // Borders
  root.style.setProperty('--border-width', tokens.borderWidth);
  root.style.setProperty('--border-color', tokens.borderColor);
  root.style.setProperty('--border-color-light', tokens.borderColorLight);
}
