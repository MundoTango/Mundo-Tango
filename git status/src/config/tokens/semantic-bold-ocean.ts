/**
 * SEMANTIC TOKENS - BOLD OCEAN HYBRID THEME
 * Layer 2: Theme-specific tokens that reference primitive tokens
 * Used by: Component tokens and theme system
 * 
 * DESIGN CHARACTERISTICS:
 * ✨ THE PERFECT BLEND ✨
 * 
 * FROM BOLD MINIMAXIMALIST:
 * - Heavy typography (800-900 weight) - DRAMATIC & IMPACTFUL
 * - Medium-sharp corners (8-10px) - MODERN WITH CHARACTER
 * - Strong shadows with color glow - DIMENSIONAL
 * - Moderate animations (200ms) - RESPONSIVE & CRISP
 * 
 * FROM MT OCEAN:
 * - Turquoise (#14b8a6) primary color - VIBRANT & TRUSTWORTHY
 * - Cyan (#06b6d4) creative accent - FRESH & ENERGETIC
 * - Teal (#0d9488) depth accent - SOPHISTICATED
 * - Glassmorphic effects - ELEGANT & MODERN
 * 
 * RESULT: Powerful bold aesthetics with refreshing ocean colors
 */

import { primitiveTokens } from './primitives';

export const boldOceanTokens = {
  // BRAND COLORS - Ocean Palette
  colorPrimary: primitiveTokens.turquoise[500],     // #14b8a6 - Vibrant turquoise
  colorSecondary: primitiveTokens.cyan[500],        // #06b6d4 - Energetic cyan
  colorAccent: primitiveTokens.teal[600],           // #0d9488 - Deep teal
  
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
  
  // TYPOGRAPHY - BOLD & HEAVY (From Bold Minimaximalist)
  fontWeightHeading: primitiveTokens.fontWeight.extrabold,  // 800 - DRAMATIC
  fontWeightSubheading: primitiveTokens.fontWeight.bold,    // 700 - STRONG
  fontWeightBody: primitiveTokens.fontWeight.semibold,      // 600 - CONFIDENT
  fontWeightCaption: primitiveTokens.fontWeight.medium,     // 500 - SOLID
  
  fontSizeHero: primitiveTokens.fontSize['7xl'],     // 72px - Massive impact
  fontSizeH1: primitiveTokens.fontSize['5xl'],       // 48px - Bold statement
  fontSizeH2: primitiveTokens.fontSize['4xl'],       // 36px - Strong presence
  fontSizeH3: primitiveTokens.fontSize['3xl'],       // 30px - Clear hierarchy
  fontSizeBody: primitiveTokens.fontSize.base,       // 16px
  fontSizeCaption: primitiveTokens.fontSize.sm,      // 14px
  
  lineHeightHeading: primitiveTokens.lineHeight.tight,  // 1.2 - Compact & powerful
  lineHeightBody: primitiveTokens.lineHeight.normal,    // 1.5 - Readable
  
  // SPACING - BALANCED (Slightly more generous than Bold, less than Ocean)
  spacingBase: primitiveTokens.space.md,      // 16px
  spacingCard: primitiveTokens.space.lg,      // 24px
  spacingSection: primitiveTokens.space['2xl'], // 48px
  spacingPage: primitiveTokens.space['3xl'],    // 64px
  
  // BORDER RADIUS - MEDIUM (Balance between sharp and soft)
  radiusBase: primitiveTokens.borderRadius.md,   // 6px
  radiusCard: primitiveTokens.borderRadius.lg,   // 10px - Friendly but modern
  radiusButton: primitiveTokens.borderRadius.lg, // 10px
  radiusInput: primitiveTokens.borderRadius.md,  // 6px
  radiusPill: primitiveTokens.borderRadius['3xl'], // 24px - For badges/pills
  
  // SHADOWS - STRONG WITH OCEAN COLORS (Turquoise glow instead of burgundy)
  shadowColor: 'rgba(20, 184, 166, 0.35)',  // Turquoise shadow with strength
  shadowColorDark: 'rgba(20, 184, 166, 0.5)',
  shadowSmall: '0 2px 6px rgba(20, 184, 166, 0.25)',
  shadowMedium: '0 4px 12px rgba(20, 184, 166, 0.3)',
  shadowLarge: '0 8px 24px rgba(20, 184, 166, 0.35)',
  shadowXLarge: '0 16px 40px rgba(20, 184, 166, 0.4)',
  
  // GLASSMORPHIC PROPERTIES (From MT Ocean)
  glassBackground: 'rgba(255, 255, 255, 0.65)',
  glassBackgroundDark: 'rgba(15, 23, 42, 0.75)',
  glassBackdropBlur: '16px',
  glassBorder: 'rgba(20, 184, 166, 0.25)',  // Turquoise tint
  glassBorderDark: 'rgba(20, 184, 166, 0.35)',
  
  // GRADIENTS - Ocean colors with Bold energy
  gradientPrimary: `linear-gradient(135deg, ${primitiveTokens.turquoise[500]} 0%, ${primitiveTokens.cyan[500]} 50%, ${primitiveTokens.teal[600]} 100%)`,
  gradientHero: `linear-gradient(to right, ${primitiveTokens.turquoise[400]}, ${primitiveTokens.cyan[500]}, ${primitiveTokens.teal[500]})`,
  gradientAccent: `linear-gradient(135deg, ${primitiveTokens.cyan[400]} 0%, ${primitiveTokens.turquoise[600]} 100%)`,
  gradientSecondary: `linear-gradient(to bottom, ${primitiveTokens.gray[50]}, ${primitiveTokens.gray[100]})`,
  
  // ANIMATIONS - MODERATE SPEED (Balance between fast Bold and smooth Ocean)
  transitionSpeed: primitiveTokens.transitionDuration.normal,    // 200ms - Crisp
  transitionSpeedSlow: primitiveTokens.transitionDuration.slow, // 300ms - Smooth
  animationCurve: primitiveTokens.transitionTiming.ease,
  
  // BORDERS
  borderWidth: '2px',  // Bold presence
  borderColor: primitiveTokens.turquoise[500],
  borderColorLight: primitiveTokens.turquoise[400],
} as const;

export type BoldOceanTokens = typeof boldOceanTokens;
