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
 */

import { chromium, Browser, Page } from 'playwright';
import { db } from '@shared/db';
import { scrapedEvents } from '@shared/schema';

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

export class JSScraper {
  private browser: Browser | null = null;

  /**
   * Initialize headless browser
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
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
          status: 'pending_review'
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
}

export const jsScraper = new JSScraper();
