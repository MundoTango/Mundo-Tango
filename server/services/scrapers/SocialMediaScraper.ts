/**
 * SOCIAL MEDIA SCRAPER
 * Abstract interface for social media event scraping
 * 
 * Features:
 * - Facebook Events integration
 * - Instagram event posts (hashtag-based)
 * - Built-in authentication handling
 * - Rate limiting and retry logic
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import logger from '../../middleware/logger';
import { ScrapedEventData } from './StaticPageScraper';

export interface SocialMediaConfig {
  platform: 'facebook' | 'instagram';
  credentials?: {
    email?: string;
    password?: string;
    cookiesPath?: string;
  };
  targets: SocialMediaTarget[];
  rateLimit?: { requestsPerMinute: number };
  headless?: boolean;
  timeout?: number;
  retries?: number;
}

export interface SocialMediaTarget {
  type: 'page' | 'group' | 'event' | 'hashtag' | 'profile';
  identifier: string;
  name?: string;
}

export interface SocialMediaEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  venue?: string;
  address?: string;
  organizer?: string;
  organizerUrl?: string;
  price?: string;
  imageUrl?: string;
  sourceUrl: string;
  externalId: string;
  platform: string;
  interestedCount?: number;
  goingCount?: number;
  tags?: string[];
}

export interface SocialMediaScrapeResult {
  success: boolean;
  events: SocialMediaEvent[];
  platform: string;
  errors: string[];
  scrapedAt: Date;
}

export abstract class BaseSocialMediaScraper {
  protected config: SocialMediaConfig;
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected lastRequestTime: number = 0;

  constructor(config: SocialMediaConfig) {
    this.config = {
      headless: true,
      timeout: 60000,
      retries: 3,
      rateLimit: { requestsPerMinute: 10 },
      ...config
    };
  }

  abstract scrape(): Promise<SocialMediaScrapeResult>;
  abstract authenticate(page: Page): Promise<boolean>;

  protected async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: this.getRandomUserAgent(),
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
  }

  protected async closeBrowser(): Promise<void> {
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    this.browser = null;
    this.context = null;
  }

  protected async enforceRateLimit(): Promise<void> {
    const minDelay = 60000 / this.config.rateLimit!.requestsPerMinute;
    const elapsed = Date.now() - this.lastRequestTime;

    if (elapsed < minDelay) {
      await this.delay(minDelay - elapsed);
    }

    this.lastRequestTime = Date.now();
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  protected toScrapedEventData(event: SocialMediaEvent): ScrapedEventData {
    return {
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      venue: event.venue,
      address: event.address,
      organizer: event.organizer,
      price: event.price,
      imageUrl: event.imageUrl,
      sourceUrl: event.sourceUrl,
      externalId: event.externalId,
      tags: event.tags
    };
  }
}

export class FacebookEventScraper extends BaseSocialMediaScraper {
  constructor(config: Omit<SocialMediaConfig, 'platform'>) {
    super({ ...config, platform: 'facebook' });
  }

  async scrape(): Promise<SocialMediaScrapeResult> {
    logger.info('[FacebookEventScraper] Starting Facebook event scrape');

    const result: SocialMediaScrapeResult = {
      success: false,
      events: [],
      platform: 'facebook',
      errors: [],
      scrapedAt: new Date()
    };

    try {
      await this.initBrowser();
      const page = await this.context!.newPage();

      const isAuthenticated = await this.authenticate(page);
      if (!isAuthenticated) {
        result.errors.push('Failed to authenticate with Facebook');
        return result;
      }

      for (const target of this.config.targets) {
        try {
          await this.enforceRateLimit();
          const events = await this.scrapeTarget(page, target);
          result.events.push(...events);
        } catch (error: any) {
          logger.error(`[FacebookEventScraper] Failed to scrape ${target.identifier}: ${error.message}`);
          result.errors.push(`Failed to scrape ${target.identifier}: ${error.message}`);
        }
      }

      result.success = result.events.length > 0 || result.errors.length === 0;
      logger.info(`[FacebookEventScraper] Completed: ${result.events.length} events`);

    } catch (error: any) {
      logger.error(`[FacebookEventScraper] Failed: ${error.message}`);
      result.errors.push(error.message);
    } finally {
      await this.closeBrowser();
    }

    return result;
  }

  async authenticate(page: Page): Promise<boolean> {
    logger.debug('[FacebookEventScraper] Attempting authentication');

    try {
      if (this.config.credentials?.cookiesPath) {
        const fs = await import('fs');
        const cookiesPath = this.config.credentials.cookiesPath;
        
        if (fs.existsSync(cookiesPath)) {
          const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
          await this.context!.addCookies(cookies);
          
          await page.goto('https://www.facebook.com', { waitUntil: 'networkidle' });
          
          const isLoggedIn = await page.$('[aria-label="Your profile"]') !== null;
          if (isLoggedIn) {
            logger.info('[FacebookEventScraper] Authenticated via cookies');
            return true;
          }
        }
      }

      if (this.config.credentials?.email && this.config.credentials?.password) {
        await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle' });

        await page.fill('#email', this.config.credentials.email);
        await page.fill('#pass', this.config.credentials.password);
        await page.click('[name="login"]');

        await page.waitForLoadState('networkidle');

        const isLoggedIn = await page.$('[aria-label="Your profile"]') !== null;
        if (isLoggedIn) {
          logger.info('[FacebookEventScraper] Authenticated via credentials');
          return true;
        }
      }

      logger.warn('[FacebookEventScraper] Proceeding without authentication');
      return true;

    } catch (error: any) {
      logger.error(`[FacebookEventScraper] Authentication error: ${error.message}`);
      return false;
    }
  }

  private async scrapeTarget(page: Page, target: SocialMediaTarget): Promise<SocialMediaEvent[]> {
    const events: SocialMediaEvent[] = [];

    let url: string;
    switch (target.type) {
      case 'page':
        url = `https://www.facebook.com/${target.identifier}/events`;
        break;
      case 'group':
        url = `https://www.facebook.com/groups/${target.identifier}/events`;
        break;
      case 'event':
        url = `https://www.facebook.com/events/${target.identifier}`;
        break;
      default:
        url = `https://www.facebook.com/events/search?q=${encodeURIComponent(target.identifier)}`;
    }

    logger.debug(`[FacebookEventScraper] Scraping: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: this.config.timeout });
    await this.delay(2000);

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.delay(1500);
    }

    if (target.type === 'event') {
      const event = await this.extractSingleEvent(page, url);
      if (event) events.push(event);
    } else {
      const eventLinks = await page.$$eval('a[href*="/events/"]', (links) =>
        links
          .map(link => link.getAttribute('href'))
          .filter(href => href && /\/events\/\d+/.test(href))
          .slice(0, 20)
      );

      const uniqueLinks = [...new Set(eventLinks)];
      
      for (const link of uniqueLinks) {
        try {
          await this.enforceRateLimit();
          const fullUrl = link!.startsWith('http') ? link! : `https://www.facebook.com${link}`;
          await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: this.config.timeout });
          await this.delay(1000);

          const event = await this.extractSingleEvent(page, fullUrl);
          if (event) events.push(event);
        } catch (error: any) {
          logger.warn(`[FacebookEventScraper] Failed to scrape event: ${error.message}`);
        }
      }
    }

    return events;
  }

  private async extractSingleEvent(page: Page, sourceUrl: string): Promise<SocialMediaEvent | null> {
    try {
      const eventData = await page.evaluate(() => {
        const getText = (selectors: string[]): string | undefined => {
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el?.textContent?.trim()) return el.textContent.trim();
          }
          return undefined;
        };

        const getImage = (): string | undefined => {
          const img = document.querySelector('[data-imgperflogname="profileCoverPhoto"] img, .cover img, img[data-imgperflogname]');
          return img?.getAttribute('src') || undefined;
        };

        const title = getText(['h1', '[data-testid="event-permalink-event-name"]', 'h2.x1heor9g']);
        const dateText = getText(['[data-testid="event-date"]', '.x1i10hfl span', 'span[title]']);
        const locationText = getText(['[data-testid="event-location"]', '.x1heor9g a span']);

        return {
          title,
          dateText,
          location: locationText,
          imageUrl: getImage(),
          description: getText(['[data-testid="event-description"]', '.x78zum5 span'])
        };
      });

      if (!eventData.title) return null;

      const eventIdMatch = sourceUrl.match(/\/events\/(\d+)/);
      const eventId = eventIdMatch ? eventIdMatch[1] : this.hashString(eventData.title + sourceUrl);

      return {
        title: eventData.title,
        description: eventData.description,
        startDate: this.parseDate(eventData.dateText),
        location: eventData.location,
        imageUrl: eventData.imageUrl,
        sourceUrl,
        externalId: `fb-${eventId}`,
        platform: 'facebook'
      };
    } catch (error: any) {
      logger.warn(`[FacebookEventScraper] Failed to extract event: ${error.message}`);
      return null;
    }
  }

  private parseDate(dateText?: string): Date {
    if (!dateText) return new Date();
    const parsed = new Date(dateText);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

export class InstagramEventScraper extends BaseSocialMediaScraper {
  constructor(config: Omit<SocialMediaConfig, 'platform'>) {
    super({ ...config, platform: 'instagram' });
  }

  async scrape(): Promise<SocialMediaScrapeResult> {
    logger.info('[InstagramEventScraper] Starting Instagram event scrape');

    const result: SocialMediaScrapeResult = {
      success: false,
      events: [],
      platform: 'instagram',
      errors: [],
      scrapedAt: new Date()
    };

    try {
      await this.initBrowser();
      const page = await this.context!.newPage();

      const isAuthenticated = await this.authenticate(page);
      if (!isAuthenticated) {
        logger.warn('[InstagramEventScraper] Proceeding without authentication');
      }

      for (const target of this.config.targets) {
        if (target.type === 'hashtag') {
          try {
            await this.enforceRateLimit();
            const events = await this.scrapeHashtag(page, target.identifier);
            result.events.push(...events);
          } catch (error: any) {
            logger.error(`[InstagramEventScraper] Failed to scrape #${target.identifier}: ${error.message}`);
            result.errors.push(`Failed to scrape #${target.identifier}`);
          }
        } else if (target.type === 'profile') {
          try {
            await this.enforceRateLimit();
            const events = await this.scrapeProfile(page, target.identifier);
            result.events.push(...events);
          } catch (error: any) {
            logger.error(`[InstagramEventScraper] Failed to scrape @${target.identifier}: ${error.message}`);
            result.errors.push(`Failed to scrape @${target.identifier}`);
          }
        }
      }

      result.success = result.events.length > 0 || result.errors.length === 0;
      logger.info(`[InstagramEventScraper] Completed: ${result.events.length} events`);

    } catch (error: any) {
      logger.error(`[InstagramEventScraper] Failed: ${error.message}`);
      result.errors.push(error.message);
    } finally {
      await this.closeBrowser();
    }

    return result;
  }

  async authenticate(page: Page): Promise<boolean> {
    try {
      if (this.config.credentials?.cookiesPath) {
        const fs = await import('fs');
        const cookiesPath = this.config.credentials.cookiesPath;
        
        if (fs.existsSync(cookiesPath)) {
          const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
          await this.context!.addCookies(cookies);
          return true;
        }
      }

      if (this.config.credentials?.email && this.config.credentials?.password) {
        await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle' });
        await this.delay(2000);

        await page.fill('input[name="username"]', this.config.credentials.email);
        await page.fill('input[name="password"]', this.config.credentials.password);
        await page.click('button[type="submit"]');

        await page.waitForLoadState('networkidle');
        await this.delay(3000);

        return true;
      }

      return true;
    } catch (error: any) {
      logger.warn(`[InstagramEventScraper] Authentication warning: ${error.message}`);
      return true;
    }
  }

  private async scrapeHashtag(page: Page, hashtag: string): Promise<SocialMediaEvent[]> {
    const events: SocialMediaEvent[] = [];
    const url = `https://www.instagram.com/explore/tags/${hashtag.replace('#', '')}/`;

    logger.debug(`[InstagramEventScraper] Scraping hashtag: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: this.config.timeout });
    await this.delay(2000);

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.delay(1500);
    }

    const posts = await page.$$('article a[href*="/p/"]');
    const postUrls: string[] = [];

    for (const post of posts.slice(0, 12)) {
      const href = await post.getAttribute('href');
      if (href) postUrls.push(href);
    }

    for (const postUrl of postUrls) {
      try {
        await this.enforceRateLimit();
        const fullUrl = postUrl.startsWith('http') ? postUrl : `https://www.instagram.com${postUrl}`;
        
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: this.config.timeout });
        await this.delay(1000);

        const event = await this.extractEventFromPost(page, fullUrl, hashtag);
        if (event) events.push(event);
      } catch (error: any) {
        logger.warn(`[InstagramEventScraper] Failed to scrape post: ${error.message}`);
      }
    }

    return events;
  }

  private async scrapeProfile(page: Page, username: string): Promise<SocialMediaEvent[]> {
    const events: SocialMediaEvent[] = [];
    const url = `https://www.instagram.com/${username}/`;

    logger.debug(`[InstagramEventScraper] Scraping profile: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: this.config.timeout });
    await this.delay(2000);

    const posts = await page.$$('article a[href*="/p/"]');
    const postUrls: string[] = [];

    for (const post of posts.slice(0, 9)) {
      const href = await post.getAttribute('href');
      if (href) postUrls.push(href);
    }

    for (const postUrl of postUrls) {
      try {
        await this.enforceRateLimit();
        const fullUrl = postUrl.startsWith('http') ? postUrl : `https://www.instagram.com${postUrl}`;
        
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: this.config.timeout });
        await this.delay(1000);

        const event = await this.extractEventFromPost(page, fullUrl, username);
        if (event) events.push(event);
      } catch (error: any) {
        logger.warn(`[InstagramEventScraper] Failed to scrape post: ${error.message}`);
      }
    }

    return events;
  }

  private async extractEventFromPost(page: Page, sourceUrl: string, context: string): Promise<SocialMediaEvent | null> {
    try {
      const postData = await page.evaluate(() => {
        const caption = document.querySelector('h1')?.textContent || 
                       document.querySelector('span._aacl')?.textContent || '';
        const imageEl = document.querySelector('article img');
        const imageUrl = imageEl?.getAttribute('src') || undefined;
        const username = document.querySelector('header a')?.textContent || '';

        return { caption, imageUrl, username };
      });

      if (!postData.caption) return null;

      const isEvent = this.detectEventInCaption(postData.caption);
      if (!isEvent) return null;

      const eventInfo = this.parseEventFromCaption(postData.caption);
      const postIdMatch = sourceUrl.match(/\/p\/([^\/]+)/);
      const postId = postIdMatch ? postIdMatch[1] : this.hashString(postData.caption);

      return {
        title: eventInfo.title || `Tango Event by @${postData.username}`,
        description: postData.caption.slice(0, 2000),
        startDate: eventInfo.date || new Date(),
        location: eventInfo.location,
        organizer: postData.username,
        organizerUrl: `https://www.instagram.com/${postData.username}/`,
        imageUrl: postData.imageUrl,
        sourceUrl,
        externalId: `ig-${postId}`,
        platform: 'instagram',
        tags: [context]
      };
    } catch (error: any) {
      logger.warn(`[InstagramEventScraper] Failed to extract event: ${error.message}`);
      return null;
    }
  }

  private detectEventInCaption(caption: string): boolean {
    const eventKeywords = [
      'milonga', 'practica', 'workshop', 'clase', 'class',
      'festival', 'encuentro', 'marathon', 'evento', 'event',
      'tango', 'baile', 'dance', 'bailar'
    ];

    const datePatterns = [
      /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/,
      /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i
    ];

    const lowerCaption = caption.toLowerCase();
    const hasEventKeyword = eventKeywords.some(kw => lowerCaption.includes(kw));
    const hasDatePattern = datePatterns.some(pattern => pattern.test(caption));

    return hasEventKeyword && hasDatePattern;
  }

  private parseEventFromCaption(caption: string): { title?: string; date?: Date; location?: string } {
    const lines = caption.split('\n');
    const title = lines[0]?.slice(0, 100);

    let date: Date | undefined;
    const dateMatch = caption.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dateMatch) {
      date = new Date(dateMatch[0]);
      if (isNaN(date.getTime())) date = undefined;
    }

    let location: string | undefined;
    const locationMatch = caption.match(/📍\s*([^\n]+)/);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }

    return { title, date, location };
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

export function createSocialMediaScraper(config: SocialMediaConfig): BaseSocialMediaScraper {
  switch (config.platform) {
    case 'facebook':
      return new FacebookEventScraper(config);
    case 'instagram':
      return new InstagramEventScraper(config);
    default:
      throw new Error(`Unsupported platform: ${config.platform}`);
  }
}

export default { FacebookEventScraper, InstagramEventScraper, createSocialMediaScraper };
