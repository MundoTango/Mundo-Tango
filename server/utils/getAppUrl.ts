/**
 * Centralized utility for getting the application URL.
 * This ensures consistent domain usage across all services.
 * 
 * Priority order:
 * 1. APP_URL environment variable (should be set in production)
 * 2. Fallback to localhost for development
 * 
 * NEVER use REPLIT_DEV_DOMAIN as fallback - it causes wrong domain in emails
 */

const CANONICAL_DOMAIN = 'https://mundotango.life';

export function getAppUrl(): string {
  // In production, APP_URL should always be set
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  
  // In development without APP_URL, use localhost
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5000';
  }
  
  // Fallback to canonical domain for production if APP_URL not set
  return CANONICAL_DOMAIN;
}

export function getCanonicalDomain(): string {
  return CANONICAL_DOMAIN;
}

export default getAppUrl;
