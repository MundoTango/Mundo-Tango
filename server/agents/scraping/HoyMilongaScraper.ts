/**
 * HOY MILONGA SCRAPER (Playwright-based)
 * Priority 1 - CRITICAL for Buenos Aires and other major tango cities
 * 
 * Uses Playwright for browser automation since HoyMilonga is a JavaScript SPA
 * Scrapes: Buenos Aires, São Paulo, Berlin, Athens, Istanbul, London, Miami, Montevideo
 * URL Pattern: hoy-milonga.com/{city}/en/milongas
 * 
 * MB.MD v9.9.3 Enhancement: Team extraction from event cards and detail pages
 */

import { chromium, Browser, Page } from 'playwright';
import { db } from '@shared/db';
import { scrapedEvents } from '@shared/schema';
import { cityMatcherService } from '../../services/CityMatcherService';

interface HoyMilongaTeamData {
  djs: string[];
  teachers: string[];
  orchestras: string[];
  performers: string[];
}

interface HoyMilongaEvent {
  title: string;
  timeRange: string;
  venue: string;
  neighborhood?: string;
  city: string;
  eventType: string;
  classes?: string;
  description?: string;
  day: string;
  sourceUrl: string;
  detailUrl?: string;
  teamData?: HoyMilongaTeamData;
}

export class HoyMilongaScraper {
  private browser: Browser | null = null;
  
  private cityCodeMap: Record<string, string> = {
    'Buenos Aires': 'buenos-aires',
    'São Paulo': 'sao-paulo',
    'Berlin': 'berlin',
    'Athens': 'athens',
    'Istanbul': 'istanbul',
    'London': 'london',
    'Miami': 'miami',
    'Montevideo': 'montevideo'
  };

  /**
   * Scrape all supported Hoy Milonga cities
   */
  async scrapeAllCities(sourceId: number): Promise<number> {
    console.log('[HoyMilonga] 🌍 Starting Playwright-based scrape for all cities');
    let totalEvents = 0;

    try {
      // Launch browser once for all cities - use system chromium
      this.browser = await chromium.launch({ 
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      });

      for (const [cityName, cityCode] of Object.entries(this.cityCodeMap)) {
        try {
          const events = await this.scrapeCity(cityName, cityCode, sourceId);
          totalEvents += events;
          console.log(`[HoyMilonga] ✅ ${cityName}: ${events} events`);
        } catch (error: any) {
          console.error(`[HoyMilonga] ❌ Failed to scrape ${cityName}:`, error.message);
        }
      }
    } finally {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }

    console.log(`[HoyMilonga] 🎉 Total events scraped: ${totalEvents}`);
    return totalEvents;
  }

  /**
   * Scrape a single city using browser automation
   */
  async scrapeSingleCity(cityName: string, sourceId: number): Promise<number> {
    const cityCode = this.cityCodeMap[cityName];
    if (!cityCode) {
      console.log(`[HoyMilonga] Unknown city: ${cityName}`);
      return 0;
    }

    try {
      this.browser = await chromium.launch({ 
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      });
      return await this.scrapeCity(cityName, cityCode, sourceId);
    } finally {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }

  /**
   * Scrape a specific city
   */
  private async scrapeCity(cityName: string, cityCode: string, sourceId: number): Promise<number> {
    console.log(`[HoyMilonga] 📍 Scraping ${cityName} with Playwright...`);

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    let events: HoyMilongaEvent[] = [];

    try {
      // Try Spanish first, then English
      for (const lang of ['es', 'en']) {
        const url = `https://hoy-milonga.com/${cityCode}/${lang}/milongas`;
        
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          
          // Wait for content to load
          await page.waitForTimeout(2000);
          
          // Extract events from the rendered page
          events = await this.extractEventsFromPage(page, cityName, url);
          
          if (events.length > 0) {
            console.log(`[HoyMilonga] Found ${events.length} events in ${lang} for ${cityName}`);
            break;
          }
        } catch (error: any) {
          console.log(`[HoyMilonga] Failed ${lang} for ${cityName}: ${error.message}`);
        }
      }
    } finally {
      await page.close();
    }

    if (events.length === 0) {
      console.log(`[HoyMilonga] ⚠️ No events found for ${cityName}`);
      return 0;
    }

    await this.storeEvents(events, sourceId, cityName);
    return events.length;
  }

  /**
   * Extract events from rendered page using Playwright
   */
  private async extractEventsFromPage(page: Page, cityName: string, sourceUrl: string): Promise<HoyMilongaEvent[]> {
    return await page.evaluate(({ cityName, sourceUrl }) => {
      const events: any[] = [];
      const seenTitles = new Set<string>();

      // HoyMilonga typically uses cards or list items for events
      // Try multiple selectors since structure may vary
      const selectors = [
        '[class*="event"]',
        '[class*="milonga"]',
        '[class*="card"]',
        'article',
        '.item',
        'li[class]'
      ];

      let cards: Element[] = [];
      for (const selector of selectors) {
        const found = Array.from(document.querySelectorAll(selector));
        if (found.length > cards.length) {
          cards = found;
        }
      }

      cards.forEach((card) => {
        try {
          // Extract title - look for headings or prominent text
          const titleEl = card.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"], strong, b');
          const title = titleEl?.textContent?.trim();
          
          if (!title || title.length < 3 || title.length > 200 || seenTitles.has(title.toLowerCase())) {
            return;
          }
          seenTitles.add(title.toLowerCase());

          // Extract time
          const timeEl = card.querySelector('[class*="time"], [class*="hora"], time, [class*="hour"]');
          const timeRange = timeEl?.textContent?.trim() || '';

          // Extract venue/location
          const venueEl = card.querySelector('[class*="venue"], [class*="location"], [class*="lugar"], address');
          const venue = venueEl?.textContent?.trim() || 'Unknown Venue';

          // Extract neighborhood
          const neighborhoodEl = card.querySelector('[class*="barrio"], [class*="neighborhood"], [class*="area"]');
          const neighborhood = neighborhoodEl?.textContent?.trim();

          // Determine event type
          const cardText = card.textContent?.toLowerCase() || '';
          let eventType = 'milonga';
          if (cardText.includes('clase') || cardText.includes('class')) eventType = 'class';
          else if (cardText.includes('práctica') || cardText.includes('practica')) eventType = 'practica';
          else if (cardText.includes('show') || cardText.includes('espectáculo')) eventType = 'show';

          // Extract day if available
          const dayEl = card.closest('[data-day]') || card.querySelector('[class*="day"]');
          const day = dayEl?.getAttribute('data-day') || 
                     dayEl?.textContent?.trim().split(' ')[0] || 
                     'various';

          // MB.MD v9.9.3: Extract team data from card text
          const teamPatterns = {
            dj: /(?:dj|musicalizador|musicaliza|music by|música por)[:\s]*([A-Za-zÀ-ÿ\s\-\.]+?)(?:\s*[,|\n<]|$)/gi,
            teacher: /(?:clase con|class with|teacher|maestro|profesor|enseña)[:\s]*([A-Za-zÀ-ÿ\s\-\.&]+?)(?:\s*[,|\n<]|$)/gi,
            orchestra: /(?:orquesta|orchestra|en vivo|live)[:\s]*([A-Za-zÀ-ÿ\s\-\.]+?)(?:\s*[,|\n<]|$)/gi,
            performer: /(?:show|exhibición|performance|bailan)[:\s]*([A-Za-zÀ-ÿ\s\-\.&]+?)(?:\s*[,|\n<]|$)/gi
          };

          const teamData: any = { djs: [], teachers: [], orchestras: [], performers: [] };
          for (const [role, pattern] of Object.entries(teamPatterns)) {
            const matches = cardText.matchAll(pattern as RegExp);
            const key = role === 'dj' ? 'djs' : role === 'teacher' ? 'teachers' : role === 'orchestra' ? 'orchestras' : 'performers';
            for (const match of matches) {
              const name = match[1]?.trim();
              if (name && name.length > 2 && name.length < 50 && !teamData[key].includes(name)) {
                teamData[key].push(name);
              }
            }
          }

          // Look for detail page link
          const detailLink = card.querySelector('a[href*="/milonga/"]');
          const detailUrl = detailLink?.getAttribute('href') || undefined;

          events.push({
            title,
            timeRange,
            venue,
            neighborhood,
            city: cityName,
            eventType,
            day,
            sourceUrl,
            detailUrl: detailUrl ? `https://hoy-milonga.com${detailUrl}` : undefined,
            teamData
          });
        } catch (e) {
          // Skip this card
        }
      });

      return events;
    }, { cityName, sourceUrl });
  }

  /**
   * MB.MD v9.9.3: Format team data for description
   */
  private formatTeamDescription(teamData?: HoyMilongaTeamData): string {
    if (!teamData) return '';
    
    const parts: string[] = [];
    if (teamData.djs.length > 0) parts.push(`DJs: ${teamData.djs.join(', ')}`);
    if (teamData.teachers.length > 0) parts.push(`Teachers: ${teamData.teachers.join(', ')}`);
    if (teamData.orchestras.length > 0) parts.push(`Live Music: ${teamData.orchestras.join(', ')}`);
    if (teamData.performers.length > 0) parts.push(`Performers: ${teamData.performers.join(', ')}`);
    
    return parts.length > 0 ? `\n\nEvent Team:\n${parts.join('\n')}` : '';
  }

  /**
   * Store scraped events in database
   */
  private async storeEvents(events: HoyMilongaEvent[], sourceId: number, cityName: string): Promise<void> {
    console.log(`[HoyMilonga] 💾 Storing ${events.length} events for ${cityName}`);

    for (const event of events) {
      try {
        // Match city to group
        const matchResult = await cityMatcherService.matchEventLocation(cityName);
        const groupId = matchResult || null;

        // Create date for next occurrence of this day
        const startDate = this.getNextDayDate(event.day);
        
        // Build description
        const descParts = [
          event.eventType.toUpperCase(),
          event.timeRange ? `Time: ${event.timeRange}` : null,
          event.venue ? `Venue: ${event.venue}` : null,
          event.neighborhood ? `Neighborhood: ${event.neighborhood}` : null,
          event.classes ? `Classes: ${event.classes}` : null,
        ].filter(Boolean);

        // MB.MD v9.9.3: Append team data to description
        const baseDescription = descParts.join(' | ');
        const teamDescription = this.formatTeamDescription(event.teamData);
        const description = baseDescription + teamDescription;
        
        if (teamDescription) {
          console.log(`[HoyMilonga] 👥 Team found for: ${event.title}`);
        }

        // Extract domain for sourceName
        let sourceName = 'HoyMilonga';
        try {
          const url = new URL(event.sourceUrl);
          sourceName = url.hostname.replace('www.', '');
        } catch {}

        await db.insert(scrapedEvents).values({
          sourceUrl: event.sourceUrl,
          sourceName,
          title: event.title,
          description,
          startDate,
          endDate: startDate,
          location: event.venue,
          address: event.neighborhood ? `${event.neighborhood}, ${cityName}` : cityName,
          organizer: event.venue !== 'Unknown Venue' ? event.venue : undefined,
          groupId,
          status: 'pending_review',
          externalId: `hoymilonga-${cityName}-${event.title}`.toLowerCase().replace(/\s+/g, '-').slice(0, 100)
        });

        console.log(`[HoyMilonga] 📎 Stored: ${event.title} → ${sourceName}`);
      } catch (err: any) {
        if (err.code === '23505') {
          // Duplicate - skip silently
        } else {
          console.error(`[HoyMilonga] Failed to store "${event.title}":`, err.message);
        }
      }
    }
  }

  /**
   * Get the next occurrence of a given day
   */
  private getNextDayDate(dayName: string): Date {
    const dayMap: Record<string, number> = {
      'domingo': 0, 'sunday': 0,
      'lunes': 1, 'monday': 1,
      'martes': 2, 'tuesday': 2,
      'miércoles': 3, 'wednesday': 3,
      'jueves': 4, 'thursday': 4,
      'viernes': 5, 'friday': 5,
      'sábado': 6, 'saturday': 6
    };

    const today = new Date();
    const targetDay = dayMap[dayName.toLowerCase()] ?? today.getDay();
    const currentDay = today.getDay();
    
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    nextDate.setHours(20, 0, 0, 0); // Default to 8 PM
    
    return nextDate;
  }
}

export const hoyMilongaScraper = new HoyMilongaScraper();
