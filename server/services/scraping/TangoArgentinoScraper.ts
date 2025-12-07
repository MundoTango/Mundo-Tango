// ============================================================================
// TANGO ARGENTINO SCRAPER - tangoargentino.com.ar
// MB.MD Phase 1 - Concrete implementation for Tango Argentino website
// ============================================================================

import { BaseEventScraper, type ScrapedEventData, type ScraperConfig } from './BaseEventScraper';

// ============================================================================
// TANGO ARGENTINO SCRAPER CLASS
// ============================================================================

export class TangoArgentinoScraper extends BaseEventScraper {
  constructor() {
    const config: ScraperConfig = {
      source: 'tangoargentino',
      baseUrl: 'https://www.tangoargentino.com.ar',
      timeout: 30000,
      retryAttempts: 3,
    };
    super(config);
  }

  // ============================================================================
  // REQUIRED ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  /**
   * Fetch all event URLs from Tango Argentino website
   */
  protected async fetchEventUrls(): Promise<string[]> {
    try {
      console.log(`[${this.config.source}] Fetching event URLs...`);
      
      // Fetch the agenda/calendar page
      const html = await this.fetchWithRetry('/agenda');
      const $ = this.loadHtml(html);
      
      const eventUrls: string[] = [];
      
      // TODO: Adjust selectors based on actual site structure
      $('.agenda-item a, .event-link, .evento-link, article.evento a').each((i, element) => {
        const href = $(element).attr('href');
        if (href && !href.includes('#') && !href.includes('javascript:')) {
          const fullUrl = href.startsWith('http') 
            ? href 
            : `${this.config.baseUrl}${href.startsWith('/') ? href : '/' + href}`;
          
          // Only include event-related URLs
          if (fullUrl.includes('/evento') || fullUrl.includes('/milonga') || fullUrl.includes('/agenda')) {
            eventUrls.push(fullUrl);
          }
        }
      });

      // Remove duplicates
      const uniqueUrls = Array.from(new Set(eventUrls));
      
      console.log(`[${this.config.source}] Found ${uniqueUrls.length} event URLs`);
      return uniqueUrls;
    } catch (error) {
      console.error(`[${this.config.source}] Error fetching event URLs:`, error);
      throw error;
    }
  }

  /**
   * Scrape a single event page from Tango Argentino
   */
  protected async scrapeEventPage(url: string, html: string): Promise<ScrapedEventData | null> {
    try {
      const $ = this.loadHtml(html);
      
      // Extract event ID
      const sourceEventId = this.extractEventId(url);
      
      // Extract title - try multiple selectors
      const title = 
        $('h1.evento-titulo, h1.event-title, .evento-nombre, article h1').first().text().trim() ||
        $('h1').first().text().trim() ||
        $('title').text().split('|')[0].trim();
      
      if (!title || title.length < 3) {
        console.log(`[${this.config.source}] Invalid or missing title for ${url}`);
        return null;
      }

      // Extract description
      const description = 
        $('.evento-descripcion, .event-description, .descripcion, article .content')
          .first()
          .text()
          .trim() || undefined;

      // Extract venue
      const venueName = 
        $('.evento-lugar, .venue, .lugar, .location')
          .first()
          .text()
          .trim() || undefined;
      
      const venueAddress = 
        $('.evento-direccion, .venue-address, .direccion, .address')
          .first()
          .text()
          .trim() || undefined;

      // Extract date and time - be flexible with selectors
      const dateText = 
        $('.evento-fecha, .event-date, .fecha, .date, time')
          .first()
          .text()
          .trim() || '';
      
      const timeText = 
        $('.evento-hora, .event-time, .hora, .time')
          .first()
          .text()
          .trim() || '';
      
      // Try to extract from combined date-time fields
      const dateTimeText = $('.evento-fecha-hora, .datetime').first().text().trim();
      
      const startDate = this.parseEventDateTime(dateText, timeText, dateTimeText);
      if (!startDate) {
        console.log(`[${this.config.source}] Could not parse date for ${url}`);
        return null;
      }

      // Extract event type
      const eventType = this.determineEventType($, title, description);

      // Extract price
      const priceInfo = 
        $('.evento-precio, .event-price, .precio, .price, .entrada, .admission')
          .first()
          .text()
          .trim() || undefined;

      // Check for organizer/DJ info
      const organizerText = $('.organizador, .organizer, .dj').text().trim();

      const eventData: ScrapedEventData = {
        sourceEventId,
        sourceUrl: url,
        title: this.cleanText(title),
        description: description ? this.cleanText(description) : undefined,
        venueName: venueName ? this.cleanText(venueName) : undefined,
        venueAddress: venueAddress ? this.cleanText(venueAddress) : undefined,
        startDate,
        eventType,
        priceInfo: priceInfo ? this.cleanText(priceInfo) : undefined,
        rawHtml: $.html(),
        rawData: {
          dateText,
          timeText,
          dateTimeText,
          organizerText,
          scrapedFrom: 'tangoargentino',
          extractedAt: new Date().toISOString(),
        },
      };

      return eventData;
    } catch (error) {
      console.error(`[${this.config.source}] Error scraping ${url}:`, error);
      return null;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Extract event ID from URL or generate one
   */
  private extractEventId(url: string): string | undefined {
    // Common URL patterns
    const patterns = [
      /\/evento\/(\d+)/,
      /\/milonga\/(\d+)/,
      /\/agenda\/(\d+)/,
      /[?&]id=(\d+)/,
      /\/(\d{4,})/,  // Any 4+ digit number in path
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Generate hash-based ID
    return Buffer.from(url).toString('base64').substring(0, 32);
  }

  /**
   * Parse date/time with multiple fallback strategies
   */
  private parseEventDateTime(dateText: string, timeText: string, dateTimeText: string): Date | null {
    // Try combined datetime first
    if (dateTimeText) {
      const date = this.parseSpanishDateTime(dateTimeText);
      if (date) return date;
    }

    // Try separate date and time
    if (dateText) {
      const date = this.parseSpanishDateTime(`${dateText} ${timeText}`);
      if (date) return date;
    }

    return null;
  }

  /**
   * Enhanced Spanish date/time parser
   */
  private parseSpanishDateTime(text: string): Date | null {
    try {
      const monthNames: Record<string, number> = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      };

      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth();
      let day = now.getDate();
      let hour = 20;
      let minute = 0;

      const lowerText = text.toLowerCase();

      // Extract day
      const dayMatch = text.match(/(\d{1,2})[\s\/\-]/);
      if (dayMatch) day = parseInt(dayMatch[1]);

      // Extract month (Spanish name or number)
      for (const [monthName, monthNum] of Object.entries(monthNames)) {
        if (lowerText.includes(monthName)) {
          month = monthNum;
          break;
        }
      }
      
      // Try numeric month
      const monthNumMatch = text.match(/[\s\/\-](\d{1,2})[\s\/\-]/);
      if (monthNumMatch) {
        const m = parseInt(monthNumMatch[1]);
        if (m >= 1 && m <= 12) month = m - 1;
      }

      // Extract year
      const yearMatch = text.match(/(20\d{2})/);
      if (yearMatch) year = parseInt(yearMatch[1]);

      // Extract time
      const timeMatch = text.match(/(\d{1,2})[:\.](\d{2})\s*(?:hs?|hrs?)?/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        minute = parseInt(timeMatch[2]);
      } else {
        const hourMatch = text.match(/(\d{1,2})\s*(?:hs?|hrs?)/);
        if (hourMatch) hour = parseInt(hourMatch[1]);
      }

      const date = new Date(year, month, day, hour, minute);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      return null;
    }
  }

  /**
   * Determine event type from content
   */
  private determineEventType($: cheerio.CheerioAPI, title: string, description?: string): string {
    const combined = `${title} ${description || ''}`.toLowerCase();
    
    // Check meta tags
    const metaType = $('meta[property="event:type"]').attr('content')?.toLowerCase();
    if (metaType) {
      if (metaType.includes('milonga')) return 'milonga';
      if (metaType.includes('class')) return 'class';
      if (metaType.includes('festival')) return 'festival';
    }

    // Check content
    if (combined.includes('milonga')) return 'milonga';
    if (combined.includes('clase') || combined.includes('class') || combined.includes('lesson')) return 'class';
    if (combined.includes('festival')) return 'festival';
    if (combined.includes('práctica') || combined.includes('practica')) return 'practica';
    if (combined.includes('show') || combined.includes('espectáculo')) return 'show';
    if (combined.includes('workshop') || combined.includes('taller')) return 'workshop';
    if (combined.includes('encuentro')) return 'festival';
    
    return 'milonga'; // Default
  }
}
