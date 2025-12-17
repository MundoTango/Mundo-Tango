/**
 * Theme Configuration for Mundo Tango Marketing Site
 * Supports easy toggling between MT Ocean and Bold Minimaximalist themes
 */

export type ThemeName = 'ocean' | 'minimaximalist';

export const themes = {
  ocean: {
    name: 'MT Ocean',
    description: 'Modern tech aesthetic with turquoise, teal, and cobalt',
    hero: 'bg-gradient-to-br from-[#5EEAD4] via-[#14B8A6] to-[#155E75]',
    heroAnimated: 'from-cyan-500 via-blue-600 to-purple-600',
    ctaPrimary: 'bg-[#14B8A6] hover:bg-[#0891B2] text-white',
    ctaSecondary: 'border-white text-white hover:bg-white hover:text-[#155E75]',
    cardBorder: 'border-[#14B8A6]',
    accentText: 'text-[#5EEAD4]',
    accentGradient: 'from-cyan-400 via-blue-400 to-purple-400',
    badge: 'bg-[#155E75] text-white',
    glowColor: 'cyan',
    primary: '#14B8A6',
    secondary: '#0891B2',
    accent: '#5EEAD4',
  },
  minimaximalist: {
    name: 'Bold Minimaximalist',
    description: 'Passionate tango aesthetic with burgundy, purple, and gold',
    hero: 'bg-gradient-to-br from-[#B91C3B] via-[#8B5CF6] to-[#5EEAD4]',
    heroAnimated: 'from-rose-600 via-purple-600 to-cyan-500',
    ctaPrimary: 'bg-[#F59E0B] hover:bg-[#D97706] text-white',
    ctaSecondary: 'border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white',
    cardBorder: 'border-[#8B5CF6]',
    accentText: 'text-[#F59E0B]',
    accentGradient: 'from-rose-400 via-purple-400 to-amber-400',
    badge: 'bg-[#B91C3B] text-white',
    glowColor: 'purple',
    primary: '#B91C3B',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
  }
};

// Change this to switch themes globally
export const ACTIVE_THEME: ThemeName = 'ocean';

export function getTheme() {
  return themes[ACTIVE_THEME];
}

export function getThemeByName(name: ThemeName) {
  return themes[name];
}
