/**
 * COMPONENT DESIGN TOKENS
 * Layer 3: Component-specific tokens that reference semantic tokens
 * Used by: UI components via theme system
 * 
 * Note: Uses {token} syntax for semantic token references
 * These are resolved at runtime based on active theme
 */

export const componentTokens = {
  // BUTTONS
  button: {
    primary: {
      background: '{colorPrimary}',
      backgroundHover: '{colorPrimaryHover}',
      text: '{colorTextPrimaryDark}',
      borderRadius: '{radiusButton}',
      fontWeight: '{fontWeightBody}',
      padding: '{spacingBase} {spacingCard}',
      shadow: '{shadowMedium}',
      transition: '{transitionSpeed}',
    },
    secondary: {
      background: 'transparent',
      backgroundHover: '{colorSurface}',
      text: '{colorPrimary}',
      border: '2px solid {colorPrimary}',
      borderRadius: '{radiusButton}',
      fontWeight: '{fontWeightBody}',
      padding: '{spacingBase} {spacingCard}',
      shadow: 'none',
      transition: '{transitionSpeed}',
    },
    ghost: {
      background: 'transparent',
      backgroundHover: '{colorSurface}',
      text: '{colorTextPrimary}',
      borderRadius: '{radiusButton}',
      fontWeight: '{fontWeightBody}',
      padding: '{spacingBase} {spacingCard}',
      shadow: 'none',
      transition: '{transitionSpeed}',
    },
  },
  
  // CARDS
  card: {
    solid: {
      background: '{colorBackground}',
      backgroundDark: '{colorSurfaceDark}',
      borderRadius: '{radiusCard}',
      padding: '{spacingCard}',
      shadow: '{shadowMedium}',
      border: 'none',
    },
    glass: {
      background: '{glassBackground}',
      backgroundDark: '{glassBackgroundDark}',
      backdropFilter: 'blur({glassBackdropBlur})',
      borderRadius: '{radiusCard}',
      padding: '{spacingCard}',
      shadow: '{shadowLarge}',
      border: '1px solid {glassBorder}',
      borderDark: '1px solid {glassBorderDark}',
    },
    outlined: {
      background: 'transparent',
      borderRadius: '{radiusCard}',
      padding: '{spacingCard}',
      shadow: 'none',
      border: '2px solid {borderColor}',
    },
  },
  
  // TYPOGRAPHY
  heading: {
    h1: {
      fontSize: '{fontSizeH1}',
      fontWeight: '{fontWeightHeading}',
      lineHeight: '{lineHeightHeading}',
      color: '{colorTextPrimary}',
      colorDark: '{colorTextPrimaryDark}',
    },
    h2: {
      fontSize: '{fontSizeH2}',
      fontWeight: '{fontWeightHeading}',
      lineHeight: '{lineHeightHeading}',
      color: '{colorTextPrimary}',
      colorDark: '{colorTextPrimaryDark}',
    },
    h3: {
      fontSize: '{fontSizeH3}',
      fontWeight: '{fontWeightSubheading}',
      lineHeight: '{lineHeightHeading}',
      color: '{colorTextPrimary}',
      colorDark: '{colorTextPrimaryDark}',
    },
  },
  
  body: {
    large: {
      fontSize: '{fontSizeBody}',
      fontWeight: '{fontWeightBody}',
      lineHeight: '{lineHeightBody}',
      color: '{colorTextPrimary}',
      colorDark: '{colorTextPrimaryDark}',
    },
    regular: {
      fontSize: '{fontSizeBody}',
      fontWeight: '{fontWeightBody}',
      lineHeight: '{lineHeightBody}',
      color: '{colorTextSecondary}',
      colorDark: '{colorTextSecondaryDark}',
    },
    caption: {
      fontSize: '{fontSizeCaption}',
      fontWeight: '{fontWeightCaption}',
      lineHeight: '{lineHeightBody}',
      color: '{colorTextMuted}',
      colorDark: '{colorTextMutedDark}',
    },
  },
  
  // FORMS
  input: {
    background: '{colorBackground}',
    backgroundDark: '{colorSurfaceDark}',
    border: '1px solid {borderColorLight}',
    borderRadius: '{radiusInput}',
    padding: '{spacingBase} {spacingCard}',
    fontSize: '{fontSizeBody}',
    fontWeight: '{fontWeightBody}',
    color: '{colorTextPrimary}',
    colorDark: '{colorTextPrimaryDark}',
    placeholderColor: '{colorTextMuted}',
    focusBorder: '2px solid {colorPrimary}',
    shadow: 'none',
    shadowFocus: '{shadowSmall}',
  },
  
  // NAVIGATION
  nav: {
    background: '{colorBackground}',
    backgroundDark: '{colorSurfaceDark}',
    borderBottom: '1px solid {borderColorLight}',
    shadow: '{shadowSmall}',
    linkColor: '{colorTextPrimary}',
    linkColorDark: '{colorTextPrimaryDark}',
    linkHoverColor: '{colorPrimary}',
    activeColor: '{colorPrimary}',
  },
  
  // BADGES
  badge: {
    primary: {
      background: '{colorPrimary}',
      text: '{colorTextPrimaryDark}',
      borderRadius: '{radiusBase}',
      padding: '0.25rem 0.75rem',
      fontSize: '{fontSizeCaption}',
      fontWeight: '{fontWeightBody}',
    },
    secondary: {
      background: '{colorSecondary}',
      text: '{colorTextPrimaryDark}',
      borderRadius: '{radiusBase}',
      padding: '0.25rem 0.75rem',
      fontSize: '{fontSizeCaption}',
      fontWeight: '{fontWeightBody}',
    },
  },
} as const;

export type ComponentTokens = typeof componentTokens;
