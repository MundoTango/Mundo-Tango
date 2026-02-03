/**
 * AGENT #117: JAVASCRIPT SITE SCRAPER
 * MB.MD Implementation
 * 
 * Responsibilities:
 * - Scrape JavaScript-rendered websites (React, Vue, Angular)
 * - Handle dynamic content loading
 * - Execute client-side JavaScript
 * - Wait for AJAX requests
 * - Handle infinite scroll
 * - Extract community metadata from dynamic About pages
 */

import { db } from '@shared/db';
import { scrapedEvents, scrapedCommunityData } from '@shared/schema';
import { languageAwareFieldMapper, SupportedLanguage } from '../../services/LanguageAwareFieldMapper';
import { detailDiscoveryService } from '../../services/DetailDiscoveryService';

type Browser = import('playwright').Browser;
type Page = import('playwright').Page;

let playwrightChromium: typeof import('playwright').chromium | null = null;
async function getChromium() {
  if (playwrightChromium) return playwrightChromium;
  try {
    const pw = await import('playwright');
    playwrightChromium = pw.chromium;
    return playwrightChromium;
  } catch {
    throw new Error('Playwright not available in this environment');
  }
}

interface DynamicEventData {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  price?: number;
  imageUrl?: string;
  url?: string;
}

interface DynamicCommunityMetadata {
  communityName?: string;
  description?: string;
  history?: string;
  rules?: string[];
  organizers?: Array<{ name: string; role: string }>;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
  contactEmail?: string;
  memberCount?: number;
  coverPhotoUrl?: string;
}

export class JSScraper {
  private browser: Browser | null = null;

  /**
   * Initialize headless browser
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      const chromium = await getChromium();
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      console.log('[Agent #117] 🌐 Browser initialized');
    }
  }

  /**
   * Scrape a JavaScript-rendered website
   */
  async scrape(source: any): Promise<number> {
    console.log(`[Agent #117] 🌐 Scraping dynamic site: ${source.name}`);

    try {
      await this.initialize();
      if (!this.browser) throw new Error('Browser not initialized');

      const page = await this.browser.newPage();
      
      // Navigate to site
      await page.goto(source.url, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });

      // Wait for events to load (site-specific selectors)
      await this.waitForEvents(page, source);

      // Extract events
      const events = await this.extractEvents(page, source);

      // Store in database
      await this.storeEvents(events, source.id);

      await page.close();
      
      console.log(`[Agent #117] ✅ Found ${events.length} events from ${source.name}`);
      return events.length;

    } catch (error) {
      console.error(`[Agent #117] ❌ Failed to scrape ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Wait for event elements to load
   */
  private async waitForEvents(page: Page, source: any): Promise<void> {
    const commonSelectors = [
      '.event-card',
      '.milonga-item',
      '[data-testid="event"]',
      'article[itemtype*="Event"]'
    ];

    for (const selector of commonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 10000 });
        return; // Found elements
      } catch {
        // Try next selector
      }
    }

    // Fallback: wait for network to be idle
    await page.waitForLoadState('networkidle');
  }

  /**
   * Extract events using JavaScript evaluation
   */
  private async extractEvents(page: Page, source: any): Promise<DynamicEventData[]> {
    const events = await page.evaluate(() => {
      const results: any[] = [];

      // Strategy 1: Look for JSON data in window object
      const windowData = (window as any);
      if (windowData.__INITIAL_STATE__ || windowData.__NEXT_DATA__) {
        const data = windowData.__INITIAL_STATE__ || windowData.__NEXT_DATA__;
        // Extract events from state (structure varies by site)
        if (data.events) {
          return data.events.map((e: any) => ({
            title: e.title || e.name,
            description: e.description,
            startDate: e.startDate || e.start_date || e.date,
            location: e.location || e.venue,
            imageUrl: e.image || e.imageUrl,
            url: e.url
          }));
        }
      }

      // Strategy 2: Extract from DOM elements
      const eventElements = document.querySelectorAll('.event-card, .milonga-item, article[itemtype*="Event"]');
      eventElements.forEach(elem => {
        const title = elem.querySelector('h2, h3, .title')?.textContent?.trim();
        const date = elem.querySelector('time, .date')?.textContent?.trim();
        const location = elem.querySelector('.location, .venue')?.textContent?.trim();
        const description = elem.querySelector('.description, p')?.textContent?.trim();
        const img = elem.querySelector('img')?.getAttribute('src');

        if (title && date) {
          results.push({
            title,
            description,
            startDate: date,
            location,
            imageUrl: img
          });
        }
      });

      return results;
    });

    // Parse dates
    return events.map(e => ({
      ...e,
      startDate: new Date(e.startDate)
    }));
  }

  /**
   * Store scraped events in database
   */
  private async storeEvents(events: DynamicEventData[], sourceId: number): Promise<void> {
    for (const event of events) {
      try {
        await db.insert(scrapedEvents).values({
          sourceId,
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          price: event.price,
          imageUrl: event.imageUrl,
          scrapedAt: new Date(),
          status: 'approved'
        });
      } catch (err) {
        console.error('[Agent #117] Failed to store event:', err);
      }
    }
  }

  /**
   * Close browser
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('[Agent #117] Browser closed');
    }
  }

  /**
   * Extract community metadata from dynamic sites
   * NEW: For sites like Hoy-Milonga with JS-rendered About pages
   */
  async extractCommunityMetadata(source: any): Promise<DynamicCommunityMetadata | null> {
    console.log(`[Agent #117] 📋 Extracting community metadata from: ${source.name}`);

    try {
      await this.initialize();
      if (!this.browser) throw new Error('Browser not initialized');

      const page = await this.browser.newPage();

      // Try About page first
      const aboutPaths = ['/about', '/about-us', '/info', '/community', '/sobre'];
      let foundAbout = false;

      for (const aboutPath of aboutPaths) {
        try {
          const aboutUrl = new URL(aboutPath, source.url).href;
          await page.goto(aboutUrl, { waitUntil: 'networkidle', timeout: 30000 });
          
          // Check if page has content
          const hasContent = await page.evaluate(() => document.body.innerText.length > 500);
          if (hasContent) {
            foundAbout = true;
            console.log(`[Agent #117] Found About page at: ${aboutUrl}`);
            break;
          }
        } catch {
          // Continue to next path
        }
      }

      // Fall back to main page
      if (!foundAbout) {
        await page.goto(source.url, { waitUntil: 'networkidle', timeout: 30000 });
      }

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Extract metadata using JavaScript evaluation
      const metadata = await page.evaluate(() => {
        const result: any = {};

        // Community name
        result.communityName = document.querySelector('h1')?.textContent?.trim() ||
                               document.querySelector('meta[property="og:title"]')?.getAttribute('content');

        // Description
        result.description = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                            document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                            document.querySelector('.about-text, .community-description, p.description')?.textContent?.trim();

        // Rules
        const ruleElements = document.querySelectorAll('.rules li, .guidelines li, ol.rules li');
        if (ruleElements.length > 0) {
          result.rules = Array.from(ruleElements).map(el => el.textContent?.trim()).filter(Boolean);
        }

        // Social links
        result.socialLinks = {};
        const fbLink = document.querySelector('a[href*="facebook.com"]');
        if (fbLink) result.socialLinks.facebook = fbLink.getAttribute('href');

        const igLink = document.querySelector('a[href*="instagram.com"]');
        if (igLink) result.socialLinks.instagram = igLink.getAttribute('href');

        const ytLink = document.querySelector('a[href*="youtube.com"]');
        if (ytLink) result.socialLinks.youtube = ytLink.getAttribute('href');

        const waLink = document.querySelector('a[href*="wa.me"], a[href*="whatsapp"]');
        if (waLink) result.socialLinks.whatsapp = waLink.getAttribute('href');

        // Contact email
        const emailMatch = document.body.innerText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) result.contactEmail = emailMatch[0];

        // Cover photo
        result.coverPhotoUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                               document.querySelector('header img, .hero img')?.getAttribute('src');

        return result;
      });

      await page.close();

      // Store if we found meaningful data
      if (metadata.description || metadata.rules?.length > 0 || metadata.socialLinks?.facebook) {
        await this.storeCommunityData(source.id, metadata);
        console.log(`[Agent #117] ✅ Extracted community metadata for ${source.name}`);
        return metadata;
      }

      return null;

    } catch (error) {
      console.error(`[Agent #117] ❌ Failed to extract community metadata:`, error);
      return null;
    }
  }

  /**
   * Store community metadata in database
   */
  private async storeCommunityData(sourceId: number, metadata: DynamicCommunityMetadata): Promise<void> {
    try {
      const dataQuality = this.calculateDataQuality(metadata);

      await db.insert(scrapedCommunityData).values({
        sourceId,
        communityName: metadata.communityName,
        description: metadata.description,
        history: metadata.history,
        rules: metadata.rules,
        organizers: metadata.organizers,
        contactEmail: metadata.contactEmail,
        facebookUrl: metadata.socialLinks?.facebook,
        instagramUrl: metadata.socialLinks?.instagram,
        youtubeUrl: metadata.socialLinks?.youtube,
        whatsappGroupLink: metadata.socialLinks?.whatsapp,
        memberCount: metadata.memberCount,
        coverPhotoUrl: metadata.coverPhotoUrl,
        dataQuality,
        approved: false
      });
    } catch (err) {
      console.error('[Agent #117] Failed to store community data:', err);
    }
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQuality(metadata: DynamicCommunityMetadata): number {
    let score = 0;
    if (metadata.communityName) score += 10;
    if (metadata.description && metadata.description.length > 50) score += 20;
    if (metadata.rules && metadata.rules.length > 0) score += 15;
    if (metadata.socialLinks?.facebook) score += 10;
    if (metadata.socialLinks?.instagram) score += 10;
    if (metadata.socialLinks?.whatsapp) score += 10;
    if (metadata.contactEmail) score += 10;
    if (metadata.coverPhotoUrl) score += 10;
    return Math.min(score, 100);
  }

  /**
   * Scrape both events AND community metadata
   */
  async scrapeWithCommunityData(source: any): Promise<{ events: number; hasCommunityData: boolean }> {
    const events = await this.scrape(source);
    const communityData = await this.extractCommunityMetadata(source);
    
    return {
      events,
      hasCommunityData: communityData !== null
    };
  }
}

export const jsScraper = new JSScraper();
