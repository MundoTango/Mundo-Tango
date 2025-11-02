/**
 * THEME ROUTE CONFIGURATION
 * Defines which routes use which visual theme
 * 
 * MARKETING ROUTES (Bold Minimaximalist):
 * - Landing/marketing pages
 * - Public-facing content
 * - Pricing pages
 * 
 * PLATFORM ROUTES (MT Ocean):
 * - All authenticated pages
 * - Admin center
 * - Social features
 * - All other pages
 */

export type VisualTheme = 'bold-minimaximalist' | 'mt-ocean';

/**
 * Marketing routes that use Bold Minimaximalist theme
 */
export const MARKETING_ROUTES = [
  '/marketing-prototype',
  '/marketing-prototype-enhanced',
  '/pricing',
  '/landing',
] as const;

/**
 * Platform routes explicitly using MT Ocean theme
 * (Default for all non-marketing routes)
 */
export const PLATFORM_ROUTES = [
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
 * Check if a route should use Bold Minimaximalist theme
 */
export function isMarketingRoute(pathname: string): boolean {
  return MARKETING_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Get the theme for a given route
 */
export function getThemeForRoute(pathname: string): VisualTheme {
  return isMarketingRoute(pathname) ? 'bold-minimaximalist' : 'mt-ocean';
}

/**
 * Get theme configuration based on route
 */
export function getRouteThemeConfig(pathname: string) {
  const visualTheme = getThemeForRoute(pathname);
  
  return {
    visualTheme,
    isMarketing: visualTheme === 'bold-minimaximalist',
    isPlatform: visualTheme === 'mt-ocean',
  };
}
