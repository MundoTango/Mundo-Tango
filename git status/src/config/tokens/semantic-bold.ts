/**
 * SEMANTIC TOKENS - BOLD MINIMAXIMALIST THEME
 * Layer 2: Theme-specific tokens that reference primitive tokens
 * Used by: Component tokens and theme system
 * 
 * DESIGN CHARACTERISTICS:
 * - Burgundy (#b91c3b) primary color - PASSIONATE & BOLD
 * - Purple (#8b5cf6) creative accent - ARTISTIC
 * - Gold (#f59e0b) warmth accent - AUTHENTIC
 * - Heavy typography (800-900 weight) - DRAMATIC
 * - Sharp corners (4-6px) - CRISP & MODERN
 * - Strong shadows with burgundy glow - DEPTH
 * - Fast animations (150ms) - ENERGETIC
 */

import { primitiveTokens } from './primitives';

export const boldMinimaximalistTokens = {
  // BRAND COLORS
  colorPrimary: primitiveTokens.burgundy[700],      // #b91c3b
  colorSecondary: primitiveTokens.purple[500],      // #8b5cf6
  colorAccent: primitiveTokens.gold[500],           // #f59e0b
  
  colorPrimaryHover: primitiveTokens.burgundy[800],
  colorSecondaryHover: primitiveTokens.purple[600],
  colorAccentHover: primitiveTokens.gold[600],
  
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
  
  // TYPOGRAPHY - HEAVY & DRAMATIC
  fontWeightHeading: primitiveTokens.fontWeight.extrabold,  // 800
  fontWeightSubheading: primitiveTokens.fontWeight.bold,    // 700
  fontWeightBody: primitiveTokens.fontWeight.semibold,      // 600
  fontWeightCaption: primitiveTokens.fontWeight.medium,     // 500
  
  fontSizeHero: primitiveTokens.fontSize['7xl'],     // 72px
  fontSizeH1: primitiveTokens.fontSize['5xl'],       // 48px
  fontSizeH2: primitiveTokens.fontSize['4xl'],       // 36px
  fontSizeH3: primitiveTokens.fontSize['3xl'],       // 30px
  fontSizeBody: primitiveTokens.fontSize.base,       // 16px
  fontSizeCaption: primitiveTokens.fontSize.sm,      // 14px
  
  lineHeightHeading: primitiveTokens.lineHeight.tight,  // 1.2
  lineHeightBody: primitiveTokens.lineHeight.normal,    // 1.5
  
  // SPACING - COMPACT & EFFICIENT
  spacingBase: primitiveTokens.space.sm,      // 8px
  spacingCard: primitiveTokens.space.md,      // 16px
  spacingSection: primitiveTokens.space['2xl'], // 48px
  spacingPage: primitiveTokens.space['3xl'],    // 64px
  
  // BORDER RADIUS - SHARP & CRISP
  radiusBase: primitiveTokens.borderRadius.sm,   // 2px
  radiusCard: primitiveTokens.borderRadius.md,   // 6px
  radiusButton: primitiveTokens.borderRadius.md, // 6px
  radiusInput: primitiveTokens.borderRadius.md,  // 6px
  
  // SHADOWS - STRONG & DRAMATIC
  shadowColor: 'rgba(185, 28, 59, 0.4)',  // Burgundy shadow
  shadowColorDark: 'rgba(185, 28, 59, 0.6)',
  shadowSmall: '0 2px 4px rgba(185, 28, 59, 0.2)',
  shadowMedium: '0 4px 8px rgba(185, 28, 59, 0.3)',
  shadowLarge: '0 8px 16px rgba(185, 28, 59, 0.4)',
  shadowXLarge: '0 16px 32px rgba(185, 28, 59, 0.5)',
  
  // GRADIENTS
  gradientPrimary: `linear-gradient(135deg, ${primitiveTokens.burgundy[700]} 0%, ${primitiveTokens.purple[500]} 50%, ${primitiveTokens.turquoise[500]} 100%)`,
  gradientHero: `linear-gradient(to right, ${primitiveTokens.burgundy[700]}, ${primitiveTokens.purple[500]}, ${primitiveTokens.gold[500]})`,
  gradientAccent: `linear-gradient(135deg, ${primitiveTokens.gold[500]} 0%, ${primitiveTokens.burgundy[700]} 100%)`,
  
  // ANIMATIONS - FAST & ENERGETIC
  transitionSpeed: primitiveTokens.transitionDuration.fast,    // 150ms
  transitionSpeedSlow: primitiveTokens.transitionDuration.normal, // 200ms
  animationCurve: primitiveTokens.transitionTiming.ease,
  
  // BORDERS
  borderWidth: '2px',
  borderColor: primitiveTokens.burgundy[700],
  borderColorLight: primitiveTokens.burgundy[400],
} as const;

export type BoldMinimaximalistTokens = typeof boldMinimaximalistTokens;
