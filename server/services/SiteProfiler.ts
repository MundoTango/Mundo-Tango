/**
 * SITE PROFILER SERVICE
 * MB.MD Pattern 58 Extension: Intelligent site structure discovery
 * 
 * Features:
 * - Categorizes sites by type (calendar_app, facebook, google_cal, static_html, cms)
 * - Discovers iCal feeds, REST APIs, Schema.org markup
 * - Extracts working CSS selectors for event data
 * - Stores profiles for monitoring and auto-healing
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '../db';
import { eventScrapingSources } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export type SiteType = 'calendar_app' | 'facebook' | 'google_cal' | 'static_html' | 'cms' | 'unknown';

export interface SiteProfile {
  url: string;
  type: SiteType;
  name: string;
  city: string;
  country: string;
  
  // Discovery results
  icalUrl?: string;           // Discovered iCal/ICS feed
  apiEndpoint?: string;       // REST API if found
  hasSchemaOrg?: boolean;     // Has Event JSON-LD
  
  // Selectors for HTML scraping
  selectors?: {
    eventContainer?: string;
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    description?: string;
    link?: string;
  };
  
  // Health tracking
  selectorVersion: number;
  lastVerified?: Date;
  healthScore: number;        // 0-100
}

// Common selector patterns for tango sites
const SELECTOR_PATTERNS = {
  eventContainer: [
    '.event-item', '.event-row', '.event-card',
    'article[class*="event"]', 'div[class*="event"]',
    '.milonga-item', '.practica-item',
    '[itemtype*="Event"]', '.listing-item',
    'tr.event', 'li.event', '.calendar-event'
  ],
  title: [
    'h1', 'h2', 'h3', 'h4',
    '.event-title', '.title', '[itemprop="name"]',
    'a.event-link', '.event-name'
  ],
  date: [
    'time', '[datetime]', '.date', '.event-date',
    '[itemprop="startDate"]', '.when', '.event-time'
  ],
  location: [
    '.venue', '.location', '[itemprop="location"]',
    '.place', '.address', '.event-venue'
  ]
};

class SiteProfiler {
  private userAgent = 'MundoTango-Profiler/1.0 (contact@mundotango.life)';

  /**
   * Profile a single site to discover its structure
   */
  async profileSite(url: string, city: string, country: string): Promise<SiteProfile> {
    const profile: SiteProfile = {
      url,
      type: 'unknown',
      name: new URL(url).hostname.replace('www.', ''),
      city,
      country,
      selectorVersion: 1,
      healthScore: 0
    };

    try {
      // Detect site type from URL
      profile.type = this.detectTypeFromUrl(url);
      
      // Skip detailed analysis for social media
      if (profile.type === 'facebook') {
        profile.healthScore = 50; // Moderate - requires special handling
        return profile;
      }
      
      if (profile.type === 'google_cal') {
        profile.icalUrl = this.extractGoogleCalendarIcal(url);
        profile.healthScore = profile.icalUrl ? 100 : 30;
        return profile;
      }

      // Fetch and analyze HTML
      const html = await this.fetchPage(url);
      if (!html) {
        return profile;
      }

      const $ = cheerio.load(html);

      // Check for iCal links
      profile.icalUrl = this.findIcalLink($, url);
      
      // Check for Schema.org Event markup
      profile.hasSchemaOrg = this.hasSchemaOrgEvents($);
      
      // Discover working selectors
      profile.selectors = this.discoverSelectors($);
      
      // Check for WordPress/CMS patterns
      if (this.isWordPress($) || this.isCMS($)) {
        profile.type = 'cms';
        profile.apiEndpoint = this.findCmsApi(url);
      } else if (profile.icalUrl) {
        profile.type = 'calendar_app';
      } else {
        profile.type = 'static_html';
      }

      // Calculate health score
      profile.healthScore = this.calculateHealthScore(profile);
      profile.lastVerified = new Date();

    } catch (error) {
      console.error(`[SiteProfiler] Error profiling ${url}:`, error);
    }

    return profile;
  }

  /**
   * Detect site type from URL patterns
   */
  private detectTypeFromUrl(url: string): SiteType {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.me')) {
      return 'facebook';
    }
    if (urlLower.includes('calendar.google.com')) {
      return 'google_cal';
    }
    if (urlLower.includes('tangomango') || urlLower.includes('tangokalender') ||
        urlLower.includes('tangocalendar') || urlLower.includes('hoy-milonga')) {
      return 'calendar_app';
    }
    
    return 'unknown';
  }

  /**
   * Extract iCal URL from Google Calendar embed
   */
  private extractGoogleCalendarIcal(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      const src = urlObj.searchParams.get('src');
      if (src) {
        return `https://calendar.google.com/calendar/ical/${encodeURIComponent(src)}/public/basic.ics`;
      }
    } catch {}
    return undefined;
  }

  /**
   * Find iCal/ICS links in page
   */
  private findIcalLink($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
    // Look for webcal:// or .ics links
    const icalPatterns = [
      'a[href*=".ics"]',
      'a[href^="webcal://"]',
      'a[href*="ical"]',
      'a[href*="calendar/export"]'
    ];

    for (const pattern of icalPatterns) {
      const link = $(pattern).first().attr('href');
      if (link) {
        return this.resolveUrl(link, baseUrl);
      }
    }

    return undefined;
  }

  /**
   * Check for Schema.org Event markup
   */
  private hasSchemaOrgEvents($: cheerio.CheerioAPI): boolean {
    const scripts = $('script[type="application/ld+json"]');
    let found = false;
    
    scripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).text());
        if (json['@type'] === 'Event' || 
            (Array.isArray(json) && json.some(i => i['@type'] === 'Event'))) {
          found = true;
        }
      } catch {}
    });

    return found;
  }

  /**
   * Discover working CSS selectors
   */
  private discoverSelectors($: cheerio.CheerioAPI): SiteProfile['selectors'] {
    const selectors: SiteProfile['selectors'] = {};

    // Find event container
    for (const pattern of SELECTOR_PATTERNS.eventContainer) {
      if ($(pattern).length > 0) {
        selectors.eventContainer = pattern;
        break;
      }
    }

    if (!selectors.eventContainer) return selectors;

    // Find child selectors within container
    const $container = $(selectors.eventContainer).first();
    
    for (const pattern of SELECTOR_PATTERNS.title) {
      if ($container.find(pattern).length > 0) {
        selectors.title = pattern;
        break;
      }
    }

    for (const pattern of SELECTOR_PATTERNS.date) {
      if ($container.find(pattern).length > 0) {
        selectors.date = pattern;
        break;
      }
    }

    for (const pattern of SELECTOR_PATTERNS.location) {
      if ($container.find(pattern).length > 0) {
        selectors.location = pattern;
        break;
      }
    }

    return selectors;
  }

  /**
   * Check if site is WordPress
   */
  private isWordPress($: cheerio.CheerioAPI): boolean {
    return $('link[href*="wp-content"]').length > 0 ||
           $('meta[name="generator"][content*="WordPress"]').length > 0;
  }

  /**
   * Check if site is a CMS
   */
  private isCMS($: cheerio.CheerioAPI): boolean {
    return $('meta[name="generator"]').length > 0 ||
           $('[class*="drupal"]').length > 0 ||
           $('[class*="joomla"]').length > 0;
  }

  /**
   * Find CMS API endpoint
   */
  private findCmsApi(url: string): string | undefined {
    const base = new URL(url);
    // WordPress REST API
    return `${base.protocol}//${base.host}/wp-json/wp/v2/`;
  }

  /**
   * Calculate health score based on profile
   */
  private calculateHealthScore(profile: SiteProfile): number {
    let score = 0;

    if (profile.icalUrl) score += 40;       // Best: has iCal feed
    if (profile.hasSchemaOrg) score += 30;  // Great: structured data
    if (profile.apiEndpoint) score += 20;   // Good: has API
    if (profile.selectors?.eventContainer) score += 10;
    if (profile.selectors?.title) score += 5;
    if (profile.selectors?.date) score += 5;

    return Math.min(100, score);
  }

  /**
   * Fetch page HTML
   */
  private async fetchPage(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 15000,
        maxRedirects: 5
      });
      return response.data;
    } catch (error) {
      console.error(`[SiteProfiler] Failed to fetch ${url}`);
      return null;
    }
  }

  /**
   * Resolve relative URL
   */
  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http') || url.startsWith('webcal')) return url;
    const base = new URL(baseUrl);
    if (url.startsWith('//')) return `${base.protocol}${url}`;
    if (url.startsWith('/')) return `${base.protocol}//${base.host}${url}`;
    return `${base.protocol}//${base.host}/${url}`;
  }

  /**
   * Save profile to database
   */
  async saveProfile(profile: SiteProfile): Promise<number> {
    const existing = await db.query.eventScrapingSources.findFirst({
      where: eq(eventScrapingSources.url, profile.url)
    });

    if (existing) {
      await db.update(eventScrapingSources)
        .set({
          name: profile.name,
          city: profile.city,
          country: profile.country,
          config: {
            type: profile.type,
            icalUrl: profile.icalUrl,
            apiEndpoint: profile.apiEndpoint,
            hasSchemaOrg: profile.hasSchemaOrg,
            selectors: profile.selectors,
            selectorVersion: profile.selectorVersion,
            healthScore: profile.healthScore
          },
          lastScrapedAt: profile.lastVerified
        })
        .where(eq(eventScrapingSources.id, existing.id));
      return existing.id;
    } else {
      const [inserted] = await db.insert(eventScrapingSources)
        .values({
          name: profile.name,
          url: profile.url,
          city: profile.city,
          country: profile.country,
          isActive: true,
          config: {
            type: profile.type,
            icalUrl: profile.icalUrl,
            apiEndpoint: profile.apiEndpoint,
            hasSchemaOrg: profile.hasSchemaOrg,
            selectors: profile.selectors,
            selectorVersion: profile.selectorVersion,
            healthScore: profile.healthScore
          }
        })
        .returning();
      return inserted.id;
    }
  }

  /**
   * Profile and save multiple sites in parallel (mb.md Pattern #7)
   */
  async profileSites(sources: Array<{ url: string; city: string; country: string }>): Promise<SiteProfile[]> {
    const BATCH_SIZE = 5;
    const profiles: SiteProfile[] = [];

    for (let i = 0; i < sources.length; i += BATCH_SIZE) {
      const batch = sources.slice(i, i + BATCH_SIZE);
      const batchProfiles = await Promise.all(
        batch.map(s => this.profileSite(s.url, s.city, s.country))
      );
      profiles.push(...batchProfiles);
      
      // Save to database
      for (const profile of batchProfiles) {
        await this.saveProfile(profile);
      }
      
      // Small delay between batches
      await new Promise(r => setTimeout(r, 500));
    }

    return profiles;
  }
}

export const siteProfiler = new SiteProfiler();
