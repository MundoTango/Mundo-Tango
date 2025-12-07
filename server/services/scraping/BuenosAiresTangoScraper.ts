// ============================================================================
// BUENOS AIRES TANGO SCRAPER - buenosairestango.org
// MB.MD Phase 1 - Concrete implementation for BA Tango website
// ============================================================================

import { BaseEventScraper, type ScrapedEventData, type ScraperConfig } from './BaseEventScraper';

// ============================================================================
// BUENOS AIRES TANGO SCRAPER CLASS
// ============================================================================

export class BuenosAiresTangoScraper extends BaseEventScraper {
  constructor() {
    const config: ScraperConfig = {
      source: 'buenosairestango',
      baseUrl: 'https://www.buenosairestango.org',
      timeout: 30000,
      retryAttempts: 3,
    };
    super(config);
  }

  // ============================================================================
  // REQUIRED ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  /**
   * Fetch all event URLs from the Buenos Aires Tango website
   * This scrapes the events calendar/listing page
   */
  protected async fetchEventUrls(): Promise<string[]> {
    try {
      console.log(`[${this.config.source}] Fetching event URLs...`);
      
      // Fetch the main events page
      const html = await this.fetchWithRetry('/eventos');
      const $ = this.loadHtml(html);
      
      const eventUrls: string[] = [];
      
      // TODO: Adjust selector based on actual HTML structure
      // This is a template - will need to be updated based on real site structure
      $('.event-item a, .evento a, .milonga-item a').each((i, element) => {
        const href = $(element).attr('href');
        if (href) {
          // Handle relative and absolute URLs
          const fullUrl = href.startsWith('http') 
            ? href 
            : `${this.config.baseUrl}${href.startsWith('/') ? href : '/' + href}`;
          eventUrls.push(fullUrl);
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
   * Scrape a single event page and extract structured data
   */
  protected async scrapeEventPage(url: string, html: string): Promise<ScrapedEventData | null> {
    try {
      const $ = this.loadHtml(html);
      
      // Extract event ID from URL if available
      const sourceEventId = this.extractEventId(url);
      
      // Extract title
      // TODO: Adjust selectors based on actual HTML structure
      const title = $('h1.event-title, h1.evento-titulo, .event-name').first().text().trim() ||
                    $('h1').first().text().trim();
      
      if (!title) {
        console.log(`[${this.config.source}] No title found for ${url}`);
        return null;
      }

      // Extract description
      const description = $('.event-description, .evento-descripcion, .event-content')
        .first()
        .text()
        .trim() || undefined;

      // Extract venue information
      const venueName = $('.venue-name, .lugar, .location-name')
        .first()
        .text()
        .trim() || undefined;
      
      const venueAddress = $('.venue-address, .direccion, .location-address')
        .first()
        .text()
        .trim() || undefined;

      // Extract date/time
      const dateText = $('.event-date, .fecha, .date').first().text().trim();
      const timeText = $('.event-time, .hora, .time').first().text().trim();
      
      const startDate = this.parseEventDate(dateText, timeText);
      if (!startDate) {
        console.log(`[${this.config.source}] Could not parse date for ${url}`);
        return null;
      }

      // Extract event type
      const eventType = this.extractEventType($, title, description);

      // Extract price information
      const priceInfo = $('.event-price, .precio, .price, .entrada')
        .first()
        .text()
        .trim() || undefined;

      // Build the scraped event data
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
          extractedAt: new Date().toISOString(),
        },
      };

      return eventData;
    } catch (error) {
      console.error(`[${this.config.source}] Error scraping event page ${url}:`, error);
      return null;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Extract event ID from URL
   */
  private extractEventId(url: string): string | undefined {
    // Try to extract ID from URL patterns like:
    // /evento/123 or /events/123 or ?id=123
    const patterns = [
      /\/evento\/(\d+)/,
      /\/events\/(\d+)/,
      /\/milonga\/(\d+)/,
      /[?&]id=(\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // If no ID pattern found, use URL hash as ID
    return Buffer.from(url).toString('base64').substring(0, 32);
  }

  /**
   * Parse event date from Spanish text
   * Handles formats like: "Sábado 15 de Diciembre", "15/12/2025", etc.
   */
  private parseEventDate(dateText: string, timeText: string): Date | null {
    try {
      // Spanish month names mapping
      const monthNames: Record<string, number> = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      };

      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth();
      let day = now.getDate();
      let hour = 20; // Default to 8 PM
      let minute = 0;

      // Extract day number
      const dayMatch = dateText.match(/(\d{1,2})/);
      if (dayMatch) {
        day = parseInt(dayMatch[1]);
      }

      // Extract month name (Spanish)
      const lowerDateText = dateText.toLowerCase();
      for (const [monthName, monthNum] of Object.entries(monthNames)) {
        if (lowerDateText.includes(monthName)) {
          month = monthNum;
          break;
        }
      }

      // Extract year if present
      const yearMatch = dateText.match(/(20\d{2})/);
      if (yearMatch) {
        year = parseInt(yearMatch[1]);
      }

      // Parse time if available
      const timeMatch = timeText.match(/(\d{1,2})[:\.](\d{2})/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        minute = parseInt(timeMatch[2]);
      } else {
        // Just hour
        const hourMatch = timeText.match(/(\d{1,2})/);
        if (hourMatch) {
          hour = parseInt(hourMatch[1]);
        }
      }

      const date = new Date(year, month, day, hour, minute);
      
      // Validate date
      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  /**
   * Determine event type from content
   */
  private extractEventType($: cheerio.CheerioAPI, title: string, description?: string): string {
    const text = `${title} ${description || ''}`.toLowerCase();
    
    if (text.includes('milonga')) return 'milonga';
    if (text.includes('clase') || text.includes('class')) return 'class';
    if (text.includes('festival')) return 'festival';
    if (text.includes('practica') || text.includes('práctica')) return 'practica';
    if (text.includes('show') || text.includes('espectáculo')) return 'show';
    if (text.includes('workshop') || text.includes('taller')) return 'workshop';
    
    return 'milonga'; // Default to milonga
  }
}
