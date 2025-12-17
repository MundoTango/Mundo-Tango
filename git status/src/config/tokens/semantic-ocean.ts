/**
 * SEMANTIC TOKENS - MT OCEAN THEME
 * Layer 2: Theme-specific tokens that reference primitive tokens
 * Used by: Component tokens and theme system
 * 
 * DESIGN CHARACTERISTICS:
 * - Turquoise (#14b8a6) primary color - CALM & TRUSTWORTHY
 * - Cyan (#06b6d4) creative accent - FRESH & MODERN
 * - Teal (#0d9488) depth accent - SOPHISTICATED
 * - Normal typography (400-600 weight) - READABLE
 * - Rounded corners (16-24px) - SOFT & FRIENDLY
 * - Glassmorphic effects with soft shadows - ELEGANT
 * - Smooth animations (300ms) - GRACEFUL
 */

import { primitiveTokens } from './primitives';

export const mtOceanTokens = {
  // BRAND COLORS
  colorPrimary: primitiveTokens.turquoise[500],     // #14b8a6
  colorSecondary: primitiveTokens.cyan[500],        // #06b6d4
  colorAccent: primitiveTokens.teal[600],           // #0d9488
  
  colorPrimaryHover: primitiveTokens.turquoise[600],
  colorSecondaryHover: primitiveTokens.cyan[600],
  colorAccentHover: primitiveTokens.teal[700],
  
  // BACKGROUND COLORS
  colorBackground: primitiveTokens.white,
  colorBackgroundDark: primitiveTokens.slate[900],
  colorSurface: primitiveTokens.gray[50],
  colorSurfaceDark: primitiveTokens.slate[800],
  
  // TEXT COLORS
  colorTextPrimary: primitiveTokens.gray[900],
  colorTextPrimaryDark: primitiveTokens.white,
  colorTextSecondary: primitiveTokens.gray[600],
  colorTextSecondaryDark: primitiveTokens.gray[300],
  colorTextMuted: primitiveTokens.gray[500],
  colorTextMutedDark: primitiveTokens.gray[400],
  
  // TYPOGRAPHY - NORMAL & READABLE
  fontWeightHeading: primitiveTokens.fontWeight.semibold,   // 600
  fontWeightSubheading: primitiveTokens.fontWeight.medium,  // 500
  fontWeightBody: primitiveTokens.fontWeight.normal,        // 400
  fontWeightCaption: primitiveTokens.fontWeight.normal,     // 400
  
  fontSizeHero: primitiveTokens.fontSize['6xl'],     // 60px
  fontSizeH1: primitiveTokens.fontSize['4xl'],       // 36px
  fontSizeH2: primitiveTokens.fontSize['3xl'],       // 30px
  fontSizeH3: primitiveTokens.fontSize['2xl'],       // 24px
  fontSizeBody: primitiveTokens.fontSize.base,       // 16px
  fontSizeCaption: primitiveTokens.fontSize.sm,      // 14px
  
  lineHeightHeading: primitiveTokens.lineHeight.snug,  // 1.375
  lineHeightBody: primitiveTokens.lineHeight.relaxed,  // 1.625
  
  // SPACING - GENEROUS & BREATHABLE
  spacingBase: primitiveTokens.space.md,      // 16px
  spacingCard: primitiveTokens.space.lg,      // 24px
  spacingSection: primitiveTokens.space['2xl'], // 48px
  spacingPage: primitiveTokens.space['4xl'],    // 96px
  
  // BORDER RADIUS - SOFT & ROUNDED
  radiusBase: primitiveTokens.borderRadius.xl,    // 12px
  radiusCard: primitiveTokens.borderRadius['2xl'], // 16px
  radiusButton: primitiveTokens.borderRadius['2xl'], // 16px
  radiusInput: primitiveTokens.borderRadius.xl,    // 12px
  
  // SHADOWS - SOFT & GLASSMORPHIC
  shadowColor: 'rgba(20, 184, 166, 0.15)',  // Turquoise shadow
  shadowColorDark: 'rgba(20, 184, 166, 0.25)',
  shadowSmall: '0 2px 8px rgba(20, 184, 166, 0.1)',
  shadowMedium: '0 4px 16px rgba(20, 184, 166, 0.15)',
  shadowLarge: '0 8px 32px rgba(20, 184, 166, 0.2)',
  shadowXLarge: '0 16px 48px rgba(20, 184, 166, 0.25)',
  
  // GLASSMORPHIC PROPERTIES
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  glassBackgroundDark: 'rgba(15, 23, 42, 0.8)',
  glassBackdropBlur: '20px',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassBorderDark: 'rgba(100, 116, 139, 0.3)',
  
  // GRADIENTS
  gradientPrimary: `linear-gradient(to right, ${primitiveTokens.turquoise[400]}, ${primitiveTokens.cyan[500]}, ${primitiveTokens.teal[600]})`,
  gradientHero: `linear-gradient(135deg, ${primitiveTokens.cyan[400]} 0%, ${primitiveTokens.turquoise[500]} 50%, ${primitiveTokens.teal[600]} 100%)`,
  gradientAccent: `linear-gradient(135deg, ${primitiveTokens.turquoise[500]} 0%, ${primitiveTokens.cyan[500]} 100%)`,
  
  // ANIMATIONS - SMOOTH & GRACEFUL
  transitionSpeed: primitiveTokens.transitionDuration.slow,    // 300ms
  transitionSpeedSlow: primitiveTokens.transitionDuration.slower, // 400ms
  animationCurve: primitiveTokens.transitionTiming.easeOut,
  
  // BORDERS
  borderWidth: '1px',
  borderColor: primitiveTokens.turquoise[500],
  borderColorLight: primitiveTokens.turquoise[400],
} as const;

export type MTOceanTokens = typeof mtOceanTokens;
