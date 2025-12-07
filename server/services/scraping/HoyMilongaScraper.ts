// ============================================================================
// HOY MILONGA SCRAPER - hoymilonga.com
// MB.MD Phase 1 - Final BA scraper implementation  
// ============================================================================

import { BaseEventScraper, type ScrapedEventData, type ScraperConfig } from './BaseEventScraper';

export class HoyMilongaScraper extends BaseEventScraper {
  constructor() {
    super({
      source: 'hoymilonga',
      baseUrl: 'https://www.hoymilonga.com',
      timeout: 30000,
      retryAttempts: 3,
    });
  }

  protected async fetchEventUrls(): Promise<string[]> {
    try {
      console.log(`[${this.config.source}] Fetching event URLs...`);
      const html = await this.fetchWithRetry('/milongas');
      const $ = this.loadHtml(html);
      const eventUrls: string[] = [];

      $('.milonga-card a, .event-card a, article.milonga a, .listing-item a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.includes('#')) {
          const url = href.startsWith('http') ? href : `${this.config.baseUrl}${href.startsWith('/') ? href : '/' + href}`;
          if (url.includes('/milonga/') || url.includes('/evento/')) eventUrls.push(url);
        }
      });

      return Array.from(new Set(eventUrls));
    } catch (error) {
      console.error(`[${this.config.source}] Error:`, error);
      throw error;
    }
  }

  protected async scrapeEventPage(url: string, html: string): Promise<ScrapedEventData | null> {
    try {
      const $ = this.loadHtml(html);
      const title = $('h1.milonga-title, h1').first().text().trim();
      if (!title) return null;

      const description = $('.milonga-description, .description').first().text().trim() || undefined;
      const venueName = $('.venue-name, .lugar').first().text().trim() || undefined;
      const venueAddress = $('.venue-address, .direccion').first().text().trim() || undefined;
      const dateText = $('.fecha, .date').first().text().trim();
      const timeText = $('.hora, .time').first().text().trim();
      const startDate = this.parseDate(dateText, timeText);
      if (!startDate) return null;

      return {
        sourceEventId: Buffer.from(url).toString('base64').substring(0, 32),
        sourceUrl: url,
        title: this.cleanText(title),
        description: description ? this.cleanText(description) : undefined,
        venueName,
        venueAddress,
        startDate,
        eventType: 'milonga',
        priceInfo: $('.price, .precio').first().text().trim() || undefined,
        rawHtml: $.html(),
        rawData: { dateText, timeText, extractedAt: new Date().toISOString() },
      };
    } catch (error) {
      console.error(`[${this.config.source}] Error scraping ${url}:`, error);
      return null;
    }
  }

  private parseDate(dateText: string, timeText: string): Date | null {
    const months: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    const now = new Date();
    let year = now.getFullYear(), month = now.getMonth(), day = now.getDate(), hour = 20, minute = 0;

    const dayMatch = dateText.match(/(\d{1,2})/);
    if (dayMatch) day = parseInt(dayMatch[1]);

    for (const [name, num] of Object.entries(months)) {
      if (dateText.toLowerCase().includes(name)) {
        month = num;
        break;
      }
    }

    const timeMatch = timeText.match(/(\d{1,2})[:\.](\d{2})/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      minute = parseInt(timeMatch[2]);
    }

    const date = new Date(year, month, day, hour, minute);
    return isNaN(date.getTime()) ? null : date;
  }
}
