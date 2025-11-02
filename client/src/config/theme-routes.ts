/**
 * THEME ROUTE CONFIGURATION
 * Defines which routes use which visual theme
 * 
 * BOLD OCEAN ROUTES (Bold Ocean Hybrid) - NEW DEFAULT:
 * - Marketing pages with Ocean colors + Bold aesthetics
 * - Landing/pricing pages
 * - Public-facing content
 * 
 * BOLD MINIMAXIMALIST ROUTES (Pure Bold):
 * - Special marketing prototypes only
 * - Burgundy color scheme
 * 
 * MT OCEAN ROUTES (Pure Ocean):
 * - Platform/social pages  
 * - All authenticated pages
 * - Admin center
 */

export type VisualTheme = 'bold-minimaximalist' | 'mt-ocean' | 'bold-ocean';

/**
 * Bold Ocean Hybrid routes - Marketing with Ocean colors
 * DEFAULT for marketing pages
 */
export const BOLD_OCEAN_ROUTES = [
  '/marketing-prototype-enhanced',
  '/pricing',
  '/landing',
  '/about',
  '/contact',
  '/volunteer',
] as const;

/**
 * Bold Minimaximalist routes - Pure burgundy theme
 * ONLY for specific prototypes
 */
export const BOLD_MINIMAXIMALIST_ROUTES = [
  '/marketing-prototype',
] as const;

/**
 * MT Ocean routes - Pure turquoise theme
 * DEFAULT for platform/authenticated pages
 */
export const MT_OCEAN_ROUTES = [
  '/',  // HomePage uses pure Ocean
  '/marketing-prototype-ocean',
  '/feed',
  '/memories',
  '/home',
  '/login',
  '/register',
  '/profile',
  '/settings',
  '/events',
  '/messages',
  '/friends',
  '/groups',
  '/admin',
] as const;

/**
 * Get the theme for a given route
 */
export function getThemeForRoute(pathname: string): VisualTheme {
  // Check Bold Ocean Hybrid first (marketing with ocean colors)
  if (BOLD_OCEAN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return 'bold-ocean';
  }
  
  // Check Bold Minimaximalist (pure burgundy - limited use)
  if (BOLD_MINIMAXIMALIST_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return 'bold-minimaximalist';
  }
  
  // Check MT Ocean explicitly
  if (MT_OCEAN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return 'mt-ocean';
  }
  
  // Default to MT Ocean for all other routes (platform pages)
  return 'mt-ocean';
}

/**
 * Get theme configuration based on route
 */
export function getRouteThemeConfig(pathname: string) {
  const visualTheme = getThemeForRoute(pathname);
  
  return {
    visualTheme,
    isBoldOcean: visualTheme === 'bold-ocean',
    isBoldMinimaximalist: visualTheme === 'bold-minimaximalist',
    isMTOcean: visualTheme === 'mt-ocean',
  };
}
