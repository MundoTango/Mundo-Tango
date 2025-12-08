/**
 * JS RENDERED SCRAPER
 * Uses Playwright for JavaScript-rendered pages
 * 
 * Features:
 * - Wait for content to load before scraping
 * - Handle infinite scroll
 * - Same extraction patterns as StaticPageScraper
 * - Stealth mode to avoid detection
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import logger from '../../middleware/logger';
import { ScrapedEventData, EventSelectors } from './StaticPageScraper';

export interface JSRenderedConfig {
  baseUrl: string;
  selectors: EventSelectors;
  waitForSelector?: string;
  waitTimeout?: number;
  infiniteScroll?: InfiniteScrollConfig;
  pagination?: JSPaginationConfig;
  rateLimit?: { requestsPerSecond: number };
  headless?: boolean;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  viewport?: { width: number; height: number };
  userAgent?: string;
}

export interface InfiniteScrollConfig {
  enabled: boolean;
  maxScrolls?: number;
  scrollDelay?: number;
  loadMoreSelector?: string;
  endOfContentSelector?: string;
}

export interface JSPaginationConfig {
  type: 'click' | 'url' | 'infinite-scroll';
  nextButtonSelector?: string;
  maxPages?: number;
}

export interface JSScrapeResult {
  success: boolean;
  events: ScrapedEventData[];
  totalPages: number;
  errors: string[];
  scrapedAt: Date;
  screenshotPath?: string;
}

export class JSRenderedScraper {
  private config: JSRenderedConfig;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private lastRequestTime: number = 0;

  constructor(config: JSRenderedConfig) {
    this.config = {
      waitTimeout: 30000,
      headless: true,
      timeout: 60000,
      retries: 3,
      retryDelay: 2000,
      rateLimit: { requestsPerSecond: 0.5 },
      viewport: { width: 1920, height: 1080 },
      ...config
    };
  }

  async scrape(): Promise<JSScrapeResult> {
    logger.info(`[JSRenderedScraper] Starting scrape for: ${this.config.baseUrl}`);
    
    const result: JSScrapeResult = {
      success: false,
      events: [],
      totalPages: 0,
      errors: [],
      scrapedAt: new Date()
    };

    try {
      await this.initBrowser();
      const events = await this.scrapeAllPages();
      result.events = events;
      result.success = true;
      result.totalPages = 1;
      
      logger.info(`[JSRenderedScraper] Completed: ${events.length} events scraped`);
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error during JS scraping';
      logger.error(`[JSRenderedScraper] Failed: ${errorMsg}`);
      result.errors.push(errorMsg);
    } finally {
      await this.closeBrowser();
    }

    return result;
  }

  private async initBrowser(): Promise<void> {
    logger.debug('[JSRenderedScraper] Initializing browser...');
    
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      userAgent: this.config.userAgent || this.getRandomUserAgent(),
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: [],
      geolocation: undefined,
      colorScheme: 'light'
    });

    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
  }

  private async closeBrowser(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async scrapeAllPages(): Promise<ScrapedEventData[]> {
    const allEvents: ScrapedEventData[] = [];
    const page = await this.context!.newPage();

    try {
      await this.enforceRateLimit();
      await this.navigateWithRetry(page, this.config.baseUrl);

      if (this.config.waitForSelector) {
        await page.waitForSelector(this.config.waitForSelector, {
          timeout: this.config.waitTimeout
        });
      } else {
        await page.waitForLoadState('networkidle');
      }

      if (this.config.infiniteScroll?.enabled) {
        await this.handleInfiniteScroll(page);
      }

      const events = await this.extractEventsFromPage(page);
      allEvents.push(...events);

      if (this.config.pagination?.type === 'click') {
        const additionalEvents = await this.handleClickPagination(page);
        allEvents.push(...additionalEvents);
      }

    } finally {
      await page.close();
    }

    return allEvents;
  }

  private async navigateWithRetry(page: Page, url: string): Promise<void> {
    const retries = this.config.retries || 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: this.config.timeout
        });
        return;
      } catch (error: any) {
        lastError = error;
        logger.warn(`[JSRenderedScraper] Navigation attempt ${attempt}/${retries} failed: ${error.message}`);
        
        if (attempt < retries) {
          await this.delay(this.config.retryDelay! * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to navigate to page');
  }

  private async handleInfiniteScroll(page: Page): Promise<void> {
    const scrollConfig = this.config.infiniteScroll!;
    const maxScrolls = scrollConfig.maxScrolls || 10;
    const scrollDelay = scrollConfig.scrollDelay || 1500;
    
    let previousHeight = 0;
    let scrollCount = 0;

    logger.debug(`[JSRenderedScraper] Starting infinite scroll (max: ${maxScrolls})`);

    while (scrollCount < maxScrolls) {
      const currentHeight = await page.evaluate(() => document.body.scrollHeight);

      if (scrollConfig.loadMoreSelector) {
        const loadMoreButton = await page.$(scrollConfig.loadMoreSelector);
        if (loadMoreButton) {
          await loadMoreButton.click();
          await this.delay(scrollDelay);
        } else if (currentHeight === previousHeight) {
          break;
        }
      } else {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.delay(scrollDelay);

        if (currentHeight === previousHeight) {
          logger.debug(`[JSRenderedScraper] Reached end of scroll at scroll ${scrollCount}`);
          break;
        }
      }

      if (scrollConfig.endOfContentSelector) {
        const endElement = await page.$(scrollConfig.endOfContentSelector);
        if (endElement) {
          logger.debug('[JSRenderedScraper] Found end of content marker');
          break;
        }
      }

      previousHeight = currentHeight;
      scrollCount++;
    }

    logger.debug(`[JSRenderedScraper] Completed ${scrollCount} scrolls`);
  }

  private async handleClickPagination(page: Page): Promise<ScrapedEventData[]> {
    const allEvents: ScrapedEventData[] = [];
    const paginationConfig = this.config.pagination!;
    const maxPages = paginationConfig.maxPages || 5;
    let pageCount = 1;

    while (pageCount < maxPages) {
      const nextButton = await page.$(paginationConfig.nextButtonSelector || 'a.next, button.next, [aria-label="Next"]');
      
      if (!nextButton) {
        logger.debug('[JSRenderedScraper] No next button found');
        break;
      }

      const isDisabled = await nextButton.evaluate((el) => 
        el.hasAttribute('disabled') || el.classList.contains('disabled')
      );

      if (isDisabled) {
        logger.debug('[JSRenderedScraper] Next button is disabled');
        break;
      }

      await this.enforceRateLimit();
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      
      if (this.config.waitForSelector) {
        await page.waitForSelector(this.config.waitForSelector, {
          timeout: this.config.waitTimeout
        });
      }

      const events = await this.extractEventsFromPage(page);
      allEvents.push(...events);
      pageCount++;
    }

    return allEvents;
  }

  private async extractEventsFromPage(page: Page): Promise<ScrapedEventData[]> {
    const selectors = this.config.selectors;
    const sourceUrl = page.url();

    const events = await page.evaluate((args) => {
      const { selectors, sourceUrl } = args;
      const events: any[] = [];
      
      const containers = document.querySelectorAll(selectors.container);
      
      containers.forEach((container, index) => {
        try {
          const getTextContent = (selector: string | undefined): string | undefined => {
            if (!selector) return undefined;
            const el = container.querySelector(selector);
            return el?.textContent?.trim() || undefined;
          };

          const getAttribute = (selector: string | undefined, attr: string): string | undefined => {
            if (!selector) return undefined;
            const el = container.querySelector(selector);
            return el?.getAttribute(attr) || undefined;
          };

          const title = getTextContent(selectors.title);
          if (!title) return;

          const linkPath = getAttribute(selectors.link, 'href');
          const eventUrl = linkPath 
            ? (linkPath.startsWith('http') ? linkPath : new URL(linkPath, sourceUrl).toString())
            : sourceUrl;

          events.push({
            title,
            description: getTextContent(selectors.description),
            dateText: getTextContent(selectors.date) || getTextContent(selectors.startDate),
            endDateText: getTextContent(selectors.endDate),
            location: getTextContent(selectors.location),
            venue: getTextContent(selectors.venue),
            address: getTextContent(selectors.address),
            organizer: getTextContent(selectors.organizer),
            priceText: getTextContent(selectors.price),
            imageUrl: getAttribute(selectors.image, 'src') || getAttribute(selectors.image, 'data-src'),
            sourceUrl: eventUrl
          });
        } catch (e) {
          console.warn(`Failed to extract event ${index}:`, e);
        }
      });

      return events;
    }, { selectors, sourceUrl });

    return events.map(e => this.processRawEvent(e, sourceUrl));
  }

  private processRawEvent(raw: any, sourceUrl: string): ScrapedEventData {
    const startDate = this.parseDate(raw.dateText);
    const endDate = raw.endDateText ? this.parseDate(raw.endDateText) : undefined;
    const { price, currency } = this.parsePrice(raw.priceText);

    return {
      title: raw.title,
      description: raw.description,
      startDate,
      endDate,
      location: raw.location,
      venue: raw.venue,
      address: raw.address,
      organizer: raw.organizer,
      price,
      currency,
      imageUrl: raw.imageUrl ? this.resolveUrl(raw.imageUrl, sourceUrl) : undefined,
      sourceUrl: raw.sourceUrl || sourceUrl,
      externalId: this.generateExternalId(raw.title, startDate, raw.sourceUrl || sourceUrl)
    };
  }

  private parseDate(dateText?: string): Date {
    if (!dateText) return new Date();
    const parsed = new Date(dateText.trim());
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private parsePrice(priceText?: string): { price?: string; currency?: string } {
    if (!priceText) return {};
    
    const patterns = [
      { pattern: /\$\s*([\d,.]+)/, currency: 'USD' },
      { pattern: /€\s*([\d,.]+)/, currency: 'EUR' },
      { pattern: /£\s*([\d,.]+)/, currency: 'GBP' },
      { pattern: /free|gratis/i, currency: undefined }
    ];

    for (const { pattern, currency } of patterns) {
      const match = priceText.match(pattern);
      if (match) {
        if (pattern.source.includes('free')) {
          return { price: '0' };
        }
        return { price: match[1]?.replace(',', '.'), currency };
      }
    }

    return { price: priceText.trim() };
  }

  private resolveUrl(path: string, baseUrl: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return path;
    }
  }

  private generateExternalId(title: string, date: Date, url: string): string {
    const hash = this.hashString(`${title}-${date.toISOString()}-${url}`);
    return `js-${hash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private async enforceRateLimit(): Promise<void> {
    const minDelay = 1000 / this.config.rateLimit!.requestsPerSecond;
    const elapsed = Date.now() - this.lastRequestTime;

    if (elapsed < minDelay) {
      await this.delay(minDelay - elapsed);
    }

    this.lastRequestTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  async takeScreenshot(page: Page, name: string): Promise<string> {
    const path = `screenshots/${name}-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    logger.debug(`[JSRenderedScraper] Screenshot saved: ${path}`);
    return path;
  }

  static createDefaultSelectors(): EventSelectors {
    return {
      container: '.event, .event-item, .event-card, article.event, [data-event], .milonga',
      title: 'h1, h2, h3, .event-title, .title, [data-title]',
      description: '.description, .event-description, p.description',
      date: '.date, .event-date, time, [datetime], .when',
      location: '.location, .venue, .event-location, .where',
      price: '.price, .event-price, .cost',
      image: 'img, .event-image img, picture img',
      link: 'a, a.event-link'
    };
  }
}

export default JSRenderedScraper;
