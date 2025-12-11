import { BaseEventScraper, ScrapedEventData } from './BaseEventScraper';

export class TangopolixScraper extends BaseEventScraper {
  private baseUrl = 'https://www.tangopolix.com';
  private eventsUrl = `${this.baseUrl}/tango-events`;

  constructor() {
    super('Tangopolix');
  }

  async scrape(): Promise<ScrapedEventData[]> {
    const $ = await this.fetchHTML(this.eventsUrl);
    const events: ScrapedEventData[] = [];

    // Find all event headings (each event starts with an h2 or h3)
    $('h2, h3').each((_, headingEl) => {
      try {
        const $heading = $(headingEl);
        const titleLink = $heading.find('a').first();
        const title = titleLink.text().trim();
        if (!title) return;

        const eventPath = titleLink.attr('href');
        if (!eventPath) return;
        const sourceUrl = eventPath.startsWith('http') ? eventPath : `${this.baseUrl}${eventPath}`;

        // Get all next siblings until the next heading
        let $current = $heading.next();
        let description = '';
        let locationText = '';
        let dateText = '';
        let category = '';
        let imageUrl: string | undefined;

        // Traverse siblings to find event data
        while ($current.length && !$current.is('h2, h3')) {
          const text = $current.text().trim();
          
          // Check for location (contains country/city pattern)
          if (text.includes(',') && text.split(',').length >= 2 && !dateText) {
            const parts = text.split(',').map(p => p.trim());
            if (parts[parts.length - 1].match(/^[A-Z][a-z]+/)) {
              locationText = text;
            }
          }
          
          // Check for dates (contains month names)
          if (text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i)) {
            dateText = text;
          }
          
          // Check for category
          if (text.includes('Category:')) {
            category = $current.find('a').text().trim();
          }
          
          // Check for description (short text between title and dates)
          if (!description && text.length > 0 && text.length < 200 && !locationText && !dateText) {
            description = text;
          }
          
          // Check for image
          if (!imageUrl) {
            const img = $current.find('img').first();
            if (img.length) {
              const src = img.attr('src');
              imageUrl = src && !src.startsWith('http') ? `${this.baseUrl}${src}` : src;
            }
          }
          
          $current = $current.next();
        }

        // Parse dates
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        if (dateText) {
          const dates = this.parseDateRange(dateText);
          startDate = dates.start;
          endDate = dates.end;
        }
        if (!startDate) return;

        // Parse location
        const { city, country } = this.parseLocation(locationText);

        events.push({
          sourceUrl,
          sourcePlatform: this.sourcePlatform,
          title,
          description,
          startDate,
          endDate,
          location: locationText,
          city,
          country,
          imageUrl,
          registrationUrl: sourceUrl,
          rawData: { category, dateText }
        });
      } catch (error) {
        console.error('Error parsing event:', error);
      }
    });

    return events;
  }

  private parseDateRange(dateText: string): { start?: Date; end?: Date } {
    const datePattern = /(\d{1,2})\s+(\w+)\s+(\d{4})/g;
    const matches = [...dateText.matchAll(datePattern)];
    if (matches.length === 0) return {};
    const start = this.parseDate(matches[0][1], matches[0][2], matches[0][3]);
    const end = matches.length > 1 ? this.parseDate(matches[1][1], matches[1][2], matches[1][3]) : undefined;
    return { start, end };
  }

  private parseDate(day: string, month: string, year: string): Date | undefined {
    const monthMap: { [key: string]: number } = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    const monthNum = monthMap[month.toLowerCase()];
    if (monthNum === undefined) return undefined;
    return new Date(parseInt(year), monthNum, parseInt(day));
  }

  private parseLocation(locationText: string): { city?: string; country?: string } {
    const parts = locationText.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return { city: parts.slice(0, -1).join(', '), country: parts[parts.length - 1] };
    }
    return { city: locationText, country: undefined };
  }
}
