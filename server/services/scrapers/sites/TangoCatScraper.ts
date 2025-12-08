import { StaticPageScraper, type ScrapedEventData, type StaticPageConfig } from '../StaticPageScraper';
import * as cheerio from 'cheerio';
import axios from 'axios';

export class TangoCatScraper extends StaticPageScraper {
  constructor() {
    const config: StaticPageConfig = {
      baseUrl: 'https://tangocat.net',
      selectors: {
        container: '.event-item, article, [class*="event"]',
        title: 'h2, h3, .event-title, [class*="title"]',
        date: '.date, .dates, [class*="date"]',
        location: '.location, [class*="location"]',
        link: 'a[href]',
        organizer: '.maestros, [class*="maestro"], [class*="teacher"]',
      },
      rateLimit: { requestsPerSecond: 0.5, burstLimit: 2 }, // 2 second delay
      timeout: 30000,
      retries: 3,
    };
    super(config);
  }

  async scrapeEvents(): Promise<ScrapedEventData[]> {
    const allEvents: ScrapedEventData[] = [];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1]; // Past, current, future

    console.log('🐱 TangoCat: Starting scrape for years:', years);

    for (const year of years) {
      try {
        const yearUrl = `${this.config.baseUrl}/${year}/`;
        console.log(`  Fetching ${yearUrl}`);
        
        const response = await axios.get(yearUrl, {
          timeout: this.config.timeout,
          headers: { 'User-Agent': this.getRandomUserAgent() },
        });

        const $ = cheerio.load(response.data);
        const events = this.parseEventsFromPage($, yearUrl);
        
        console.log(`  ✅ Found ${events.length} events for ${year}`);
        allEvents.push(...events);

        // Rate limiting
        await this.sleep(2000);
      } catch (error) {
        console.error(`  ❌ Error scraping year ${year}:`, error.message);
      }
    }

    console.log(`🐱 TangoCat: Total events scraped: ${allEvents.length}`);
    return allEvents;
  }

  private parseEventsFromPage($: cheerio.CheerioAPI, pageUrl: string): ScrapedEventData[] {
    const events: ScrapedEventData[] = [];

    // Try multiple selectors to find event containers
    const containers = $('.event-item, article, .item, [itemtype*="Event"]');
    
    containers.each((i, el) => {
      try {
        const $el = $(el);
        
        const title = $el.find('h2, h3, .event-title').first().text().trim() ||
                     $el.find('[class*="title"]').first().text().trim();
        
        const dates = $el.find('.date, .dates, [class*="date"]').first().text().trim();
        
        const location = $el.find('.location, [class*="location"]').first().text().trim() ||
                        $el.find('button[class*="location"]').text().trim();
        
        const link = $el.find('a').first().attr('href');
        const fullUrl = link ? (link.startsWith('http') ? link : `${this.config.baseUrl}${link}`) : pageUrl;
        
        // Extract maestros/teachers
        const maestros = $el.find('.maestros, [class*="maestro"]').text().trim();
        const teachers = maestros ? maestros.split(',').map(t => t.trim()).filter(t => t) : [];

        if (title && dates) {
          events.push({
            title,
            startDate: this.parseDate(dates),
            endDate: this.parseEndDate(dates),
            location: location || 'Unknown',
            description: `Event from TangoCat - ${dates}`,
            link: fullUrl,
            organizer: teachers.length > 0 ? teachers[0] : undefined,
            tags: ['TangoCat', ...teachers.slice(0, 3)],
          });
        }
      } catch (error) {
        console.error('Error parsing event:', error.message);
      }
    });

    return events;
  }

  private parseDate(dateStr: string): Date {
    // Parse formats like "December 27 - January 2, 2026" or "Dec 27-Jan 2, 2026"
    const now = new Date();
    
    // Try to extract year
    const yearMatch = dateStr.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : now.getFullYear();
    
    // Try to extract month and day
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < monthNames.length; i++) {
      if (dateStr.includes(monthNames[i]) || dateStr.includes(shortMonths[i])) {
        // Extract day number after month
        const dayMatch = dateStr.match(new RegExp(`${monthNames[i]}|${shortMonths[i]}[^\\d]*(\\d{1,2})`));
        if (dayMatch) {
          const day = dayMatch[1] ? parseInt(dayMatch[1]) : 1;
          return new Date(year, i, day);
        }
      }
    }
    
    return now; // Fallback
  }

  private parseEndDate(dateStr: string): Date | undefined {
    // Try to parse end date from range
    const rangeMatch = dateStr.match(/-(\w+)\s+(\d{1,2})/);
    if (rangeMatch) {
      const startDate = this.parseDate(dateStr);
      // If end date is present, add some days
      return new Date(startDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // +3 days default
    }
    return undefined;
  }

  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'MundoTango-Bot/1.0 (+https://mundotango.com/bot)',
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
