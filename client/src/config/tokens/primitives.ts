/**
 * PRIMITIVE DESIGN TOKENS
 * Layer 1: Raw values that never reference other tokens
 * Used by: Semantic tokens only
 * 
 * MB.MD Protocol: Built simultaneously, critically, recursively
 * Part of: Complete Design System (142 pages)
 */

export const primitiveTokens = {
  // BOLD MINIMAXIMALIST COLORS
  burgundy: {
    50: '#fdf2f4',
    100: '#fce7eb',
    200: '#f9cfd6',
    300: '#f5a7b4',
    400: '#ee7489',
    500: '#e3475f',
    600: '#cf274a',
    700: '#b91c3b',  // PRIMARY BURGUNDY
    800: '#991a35',
    900: '#801931',
  },
  purple: {
    400: '#a78bfa',
    500: '#8b5cf6',  // CREATIVE PURPLE
    600: '#7c3aed',
    700: '#6d28d9',
  },
  gold: {
    400: '#fbbf24',
    500: '#f59e0b',  // WARMTH GOLD
    600: '#d97706',
  },
  
  // MT OCEAN COLORS
  turquoise: {
    400: '#2dd4bf',
    500: '#14b8a6',  // PRIMARY OCEAN
    600: '#0d9488',
  },
  cyan: {
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
  },
  teal: {
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
  },
  
  // NEUTRAL COLORS
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  slate: {
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // SPACING (8px grid system)
  space: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  // TYPOGRAPHY SCALE
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },
  
  // FONT WEIGHTS
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  // BORDER RADIUS
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // LINE HEIGHTS
  lineHeight: {
    tight: '1.2',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // TRANSITIONS
  transitionDuration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
  },
  
  transitionTiming: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Z-INDEX SCALE
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
} as const;

export type PrimitiveTokens = typeof primitiveTokens;
