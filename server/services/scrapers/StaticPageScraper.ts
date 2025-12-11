/**
 * STATIC PAGE SCRAPER
 * Scrapes static HTML pages for event listings
 * 
 * Features:
 * - Support for common event listing patterns (tables, lists, cards)
 * - Extract: title, date, location, description, price, source URL
 * - Handle pagination
 * - Built-in rate limiting
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import logger from '../../middleware/logger';

export interface ScrapedEventData {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  address?: string;
  venue?: string;
  city?: string;
  country?: string;
  organizer?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  sourceUrl: string;
  externalId?: string;
  tags?: string[];
  eventType?: string;
}

export interface StaticPageConfig {
  baseUrl: string;
  selectors: EventSelectors;
  pagination?: PaginationConfig;
  rateLimit?: RateLimitConfig;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface EventSelectors {
  container: string;
  title: string;
  description?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  location?: string;
  address?: string;
  venue?: string;
  price?: string;
  image?: string;
  link?: string;
  organizer?: string;
  tags?: string;
}

export interface PaginationConfig {
  type: 'page-number' | 'next-link' | 'load-more' | 'offset';
  selector?: string;
  paramName?: string;
  maxPages?: number;
  startPage?: number;
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  burstLimit?: number;
}

export interface ScrapeResult {
  success: boolean;
  events: ScrapedEventData[];
  totalPages: number;
  errors: string[];
  scrapedAt: Date;
}

export class StaticPageScraper {
  private config: StaticPageConfig;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly defaultUserAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  constructor(config: StaticPageConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      rateLimit: { requestsPerSecond: 1 },
      ...config
    };
  }

  async scrape(): Promise<ScrapeResult> {
    logger.info(`[StaticPageScraper] Starting scrape for: ${this.config.baseUrl}`);
    
    const result: ScrapeResult = {
      success: false,
      events: [],
      totalPages: 0,
      errors: [],
      scrapedAt: new Date()
    };

    try {
      const events = await this.scrapeAllPages();
      result.events = events;
      result.success = true;
      result.totalPages = this.requestCount;
      
      logger.info(`[StaticPageScraper] Completed: ${events.length} events from ${result.totalPages} pages`);
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error during scraping';
      logger.error(`[StaticPageScraper] Failed: ${errorMsg}`);
      result.errors.push(errorMsg);
    }

    return result;
  }

  private async scrapeAllPages(): Promise<ScrapedEventData[]> {
    const allEvents: ScrapedEventData[] = [];
    let currentUrl = this.config.baseUrl;
    let pageCount = 0;
    const maxPages = this.config.pagination?.maxPages || 10;

    while (currentUrl && pageCount < maxPages) {
      await this.enforceRateLimit();
      
      const html = await this.fetchPage(currentUrl);
      const $ = cheerio.load(html);
      
      const events = this.extractEvents($, currentUrl);
      allEvents.push(...events);
      
      pageCount++;
      this.requestCount++;

      currentUrl = this.getNextPageUrl($, currentUrl, pageCount);
      
      if (!currentUrl) {
        logger.debug(`[StaticPageScraper] No more pages found after page ${pageCount}`);
        break;
      }
    }

    return allEvents;
  }

  private async fetchPage(url: string): Promise<string> {
    const retries = this.config.retries || 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, this.buildRequestConfig());
        return response.data;
      } catch (error: any) {
        lastError = error;
        logger.warn(`[StaticPageScraper] Attempt ${attempt}/${retries} failed for ${url}: ${error.message}`);
        
        if (attempt < retries) {
          await this.delay(this.config.retryDelay! * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to fetch page');
  }

  private buildRequestConfig(): AxiosRequestConfig {
    return {
      headers: {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        ...this.config.headers
      },
      timeout: this.config.timeout,
      responseType: 'text'
    };
  }

  private extractEvents($: cheerio.CheerioAPI, sourceUrl: string): ScrapedEventData[] {
    const events: ScrapedEventData[] = [];
    const selectors = this.config.selectors;

    $(selectors.container).each((index, element) => {
      try {
        const event = this.extractEventFromElement($, $(element), sourceUrl);
        if (event && event.title) {
          events.push(event);
        }
      } catch (error: any) {
        logger.warn(`[StaticPageScraper] Failed to extract event ${index}: ${error.message}`);
      }
    });

    return events;
  }

  private extractEventFromElement(
    $: cheerio.CheerioAPI,
    element: cheerio.Cheerio<any>,
    sourceUrl: string
  ): ScrapedEventData | null {
    const selectors = this.config.selectors;

    const title = this.extractText(element, selectors.title);
    if (!title) return null;

    const description = selectors.description 
      ? this.extractText(element, selectors.description) 
      : undefined;
    
    const dateText = selectors.date 
      ? this.extractText(element, selectors.date) 
      : selectors.startDate 
        ? this.extractText(element, selectors.startDate)
        : undefined;
    
    const startDate = this.parseDate(dateText);
    
    const endDateText = selectors.endDate 
      ? this.extractText(element, selectors.endDate) 
      : undefined;
    const endDate = endDateText ? this.parseDate(endDateText) : undefined;

    const location = selectors.location 
      ? this.extractText(element, selectors.location) 
      : undefined;
    
    const venue = selectors.venue 
      ? this.extractText(element, selectors.venue) 
      : undefined;
    
    const address = selectors.address 
      ? this.extractText(element, selectors.address) 
      : undefined;

    const priceText = selectors.price 
      ? this.extractText(element, selectors.price) 
      : undefined;
    const { price, currency } = this.parsePrice(priceText);

    const imageUrl = selectors.image 
      ? this.extractAttribute(element, selectors.image, 'src') 
        || this.extractAttribute(element, selectors.image, 'data-src')
      : undefined;

    const linkPath = selectors.link 
      ? this.extractAttribute(element, selectors.link, 'href') 
      : undefined;
    const eventUrl = linkPath ? this.resolveUrl(linkPath, sourceUrl) : sourceUrl;

    const organizer = selectors.organizer 
      ? this.extractText(element, selectors.organizer) 
      : undefined;

    const tagsText = selectors.tags 
      ? this.extractText(element, selectors.tags) 
      : undefined;
    const tags = tagsText ? tagsText.split(/[,;]/).map(t => t.trim()).filter(Boolean) : undefined;

    const externalId = this.generateExternalId(title, startDate, eventUrl);

    return {
      title: title.trim(),
      description: description?.trim(),
      startDate,
      endDate,
      location: location?.trim(),
      venue: venue?.trim(),
      address: address?.trim(),
      organizer: organizer?.trim(),
      price,
      currency,
      imageUrl: imageUrl ? this.resolveUrl(imageUrl, sourceUrl) : undefined,
      sourceUrl: eventUrl,
      externalId,
      tags
    };
  }

  private extractText(element: cheerio.Cheerio<any>, selector: string): string | undefined {
    const found = element.find(selector);
    if (found.length > 0) {
      return found.first().text().trim() || undefined;
    }
    if (element.is(selector)) {
      return element.text().trim() || undefined;
    }
    return undefined;
  }

  private extractAttribute(
    element: cheerio.Cheerio<any>, 
    selector: string, 
    attr: string
  ): string | undefined {
    const found = element.find(selector);
    if (found.length > 0) {
      return found.first().attr(attr) || undefined;
    }
    if (element.is(selector)) {
      return element.attr(attr) || undefined;
    }
    return undefined;
  }

  private parseDate(dateText?: string): Date {
    if (!dateText) return new Date();

    const cleanedDate = dateText
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s,:-]/g, '')
      .trim();

    const parsed = new Date(cleanedDate);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
      /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})/i
    ];

    for (const pattern of datePatterns) {
      const match = cleanedDate.match(pattern);
      if (match) {
        const attemptParse = new Date(match[0]);
        if (!isNaN(attemptParse.getTime())) {
          return attemptParse;
        }
      }
    }

    return new Date();
  }

  private parsePrice(priceText?: string): { price?: string; currency?: string } {
    if (!priceText) return {};

    const currencyPatterns = [
      { pattern: /\$\s*([\d,.]+)/, currency: 'USD' },
      { pattern: /€\s*([\d,.]+)/, currency: 'EUR' },
      { pattern: /£\s*([\d,.]+)/, currency: 'GBP' },
      { pattern: /([\d,.]+)\s*(USD|EUR|GBP|ARS|BRL)/i, currency: null },
      { pattern: /free|gratis|libre/i, currency: undefined }
    ];

    for (const { pattern, currency } of currencyPatterns) {
      const match = priceText.match(pattern);
      if (match) {
        if (pattern.source.includes('free')) {
          return { price: '0', currency: undefined };
        }
        return {
          price: match[1]?.replace(',', '.') || priceText,
          currency: currency || match[2]?.toUpperCase()
        };
      }
    }

    return { price: priceText.trim() };
  }

  private getNextPageUrl(
    $: cheerio.CheerioAPI, 
    currentUrl: string, 
    currentPage: number
  ): string | null {
    const pagination = this.config.pagination;
    if (!pagination) return null;

    switch (pagination.type) {
      case 'next-link':
        const nextLink = $(pagination.selector || 'a[rel="next"], .next a, a.next, .pagination a:contains("Next")').attr('href');
        return nextLink ? this.resolveUrl(nextLink, currentUrl) : null;

      case 'page-number':
        const nextPage = currentPage + (pagination.startPage || 1);
        const paramName = pagination.paramName || 'page';
        const url = new URL(currentUrl);
        url.searchParams.set(paramName, nextPage.toString());
        return url.toString();

      case 'offset':
        const offset = currentPage * 20;
        const offsetUrl = new URL(currentUrl);
        offsetUrl.searchParams.set(pagination.paramName || 'offset', offset.toString());
        return offsetUrl.toString();

      default:
        return null;
    }
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
    return `static-${hash}`;
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
    const rateLimit = this.config.rateLimit!;
    const minDelay = 1000 / rateLimit.requestsPerSecond;
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
    return this.defaultUserAgents[Math.floor(Math.random() * this.defaultUserAgents.length)];
  }

  static createDefaultSelectors(): EventSelectors {
    return {
      container: '.event, .event-item, .event-card, article.event, [data-event], .milonga, .tango-event',
      title: 'h1, h2, h3, .event-title, .title, [data-title]',
      description: '.description, .event-description, p.description, .summary',
      date: '.date, .event-date, time, [datetime], .when',
      location: '.location, .venue, .event-location, .where, .place',
      price: '.price, .event-price, .cost, .ticket-price',
      image: 'img, .event-image img, .thumbnail img',
      link: 'a, a.event-link, a.more-info'
    };
  }
}

export default StaticPageScraper;
