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

import { db } from '@shared/db';
import { scrapedEvents } from '@shared/schema';
import { cityMatcherService } from '../../services/CityMatcherService';
import { detailDiscoveryService } from '../../services/DetailDiscoveryService';
import { languageAwareFieldMapper } from '../../services/LanguageAwareFieldMapper';
import { attachParticipantProfiles } from '../../services/ParticipantProfileHelper';
import { RecurringEventDetector } from '../../services/RecurringEventDetector';
import { InfiniteScrollHelper } from '../../services/InfiniteScrollHelper';

type Browser = import('playwright').Browser;
type Page = import('playwright').Page;

let playwrightChromium: typeof import('playwright').chromium | null = null;
async function getChromium() {
  if (playwrightChromium) return playwrightChromium;
  try {
    const pw = await import('playwright');
    playwrightChromium = pw.chromium;
    return playwrightChromium;
  } catch {
    throw new Error('Playwright not available in this environment');
  }
}

interface HoyMilongaTeamData {
  djs: string[];
  teachers: string[];
  orchestras: string[];
  performers: string[];
  organizers: string[];
  hosts: string[];
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
  fullAddress?: string;
  price?: string;
  status?: string;
  coverImage?: string;
}

export class HoyMilongaScraper {
  private browser: Browser | null = null;
  
  private cityCodeMap: Record<string, string> = {
    'Buenos Aires': 'buenos-aires',
    'São Paulo': 'sao-paulo',
    'Berlin': 'berlin',
    'Athens': 'athens',
    'Istanbul': 'turkey',
    'London': 'england',
    'Miami': 'miami',
    'Montevideo': 'montevideo',
    'Nordrhein-Westfalen': 'nordrhein-westfalen',
    'Copenhagen': 'copenhagen',
    'Amsterdam': 'amsterdam',
    'Paris': 'paris',
    'Rome': 'rome',
    'Madrid': 'madrid',
    'Barcelona': 'barcelona',
    'Lisbon': 'lisbon',
    'Vienna': 'vienna',
    'Munich': 'munich',
    'Hamburg': 'hamburg',
    'Zurich': 'zurich',
    'Geneva': 'geneva',
    'Brussels': 'brussels',
    'Prague': 'prague',
    'Warsaw': 'warsaw',
    'Moscow': 'moscow',
    'Tokyo': 'tokyo',
    'Sydney': 'sydney',
    'Melbourne': 'melbourne',
    'New York': 'new-york',
    'Los Angeles': 'los-angeles',
    'San Francisco': 'san-francisco',
    'Chicago': 'chicago'
  };

  private cityCountryMap: Record<string, string> = {
    'Buenos Aires': 'Argentina',
    'São Paulo': 'Brazil',
    'Berlin': 'Germany',
    'Athens': 'Greece',
    'Istanbul': 'Turkey',
    'London': 'United Kingdom',
    'Miami': 'United States',
    'Montevideo': 'Uruguay',
    'Nordrhein-Westfalen': 'Germany',
    'Copenhagen': 'Denmark',
    'Amsterdam': 'Netherlands',
    'Paris': 'France',
    'Rome': 'Italy',
    'Madrid': 'Spain',
    'Barcelona': 'Spain',
    'Lisbon': 'Portugal',
    'Vienna': 'Austria',
    'Munich': 'Germany',
    'Hamburg': 'Germany',
    'Zurich': 'Switzerland',
    'Geneva': 'Switzerland',
    'Brussels': 'Belgium',
    'Prague': 'Czech Republic',
    'Warsaw': 'Poland',
    'Moscow': 'Russia',
    'Tokyo': 'Japan',
    'Sydney': 'Australia',
    'Melbourne': 'Australia',
    'New York': 'United States',
    'Los Angeles': 'United States',
    'San Francisco': 'United States',
    'Chicago': 'United States'
  };

  /**
   * Scrape all supported Hoy Milonga cities
   */
  async scrapeAllCities(sourceId: number): Promise<number> {
    console.log('[HoyMilonga] 🌍 Starting Playwright-based scrape for all cities');
    let totalEvents = 0;

    try {
      // Launch browser once for all cities - use dynamic import
      const chromium = await getChromium();
      this.browser = await chromium.launch({ 
        headless: true,
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
      const chromium = await getChromium();
      this.browser = await chromium.launch({ 
        headless: true,
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
   * CRITICAL: HoyMilonga uses infinite scroll - must scroll to load all events!
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
          
          // CRITICAL: HoyMilonga uses infinite scroll - use helper to load ALL events!
          console.log(`[HoyMilonga] 📜 Scrolling to load all events for ${cityName}...`);
          await InfiniteScrollHelper.scrollUntilEnd(page, {
            maxScrolls: 20,
            delayMs: 600,
            heightThreshold: 100
          });
          
          // Final extraction after all scrolling
          events = await this.extractEventsFromPage(page, cityName, url);
          
          if (events.length > 0) {
            console.log(`[HoyMilonga] ✅ Found ${events.length} events in ${lang} for ${cityName}`);
            break;
          }
        } catch (error: any) {
          console.log(`[HoyMilonga] ❌ Failed ${lang} for ${cityName}: ${error.message}`);
        }
      }
    } finally {
      await page.close();
    }

    if (events.length === 0) {
      console.log(`[HoyMilonga] ⚠️ No events found for ${cityName}`);
      return 0;
    }

    // MB.MD v9.9.3: Enrich events by fetching detail pages
    const enrichedEvents = await this.enrichEventsFromDetailPages(events);

    await this.storeEvents(enrichedEvents, sourceId, cityName);
    return enrichedEvents.length;
  }

  /**
   * MB.MD v9.9.3: Enrich events by fetching detail pages
   * Extracts: full address, organizers, price, cover image, status
   */
  private async enrichEventsFromDetailPages(events: HoyMilongaEvent[]): Promise<HoyMilongaEvent[]> {
    const eventsWithDetailUrls = events.filter(e => e.detailUrl);
    
    if (eventsWithDetailUrls.length === 0) {
      console.log(`[HoyMilonga] ⚠️ No detail URLs found, skipping enrichment`);
      return events;
    }

    console.log(`[HoyMilonga] 🔍 Enriching ${eventsWithDetailUrls.length} events from detail pages...`);

    let enrichedCount = 0;
    
    for (const event of events) {
      if (!event.detailUrl) continue;

      try {
        const detailData = await detailDiscoveryService.fetchDetailPage(event.detailUrl);
        
        if (detailData) {
          // Merge detail page data with existing event data
          if (detailData.venue && event.venue === 'Unknown Venue') {
            event.venue = detailData.venue;
          }
          
          if (detailData.fullAddress || detailData.address) {
            event.fullAddress = detailData.fullAddress || detailData.address;
          }
          
          if (detailData.price) {
            event.price = detailData.price;
          }
          
          if (detailData.status) {
            event.status = detailData.status;
          }
          
          if (detailData.coverImage) {
            event.coverImage = detailData.coverImage;
          }

          // Merge team data
          if (!event.teamData) {
            event.teamData = { djs: [], teachers: [], orchestras: [], performers: [], organizers: [], hosts: [] };
          }
          
          if (detailData.organizers.length > 0) {
            event.teamData.organizers = Array.from(new Set([...(event.teamData.organizers || []), ...detailData.organizers]));
          }
          if (detailData.djs.length > 0) {
            event.teamData.djs = Array.from(new Set([...event.teamData.djs, ...detailData.djs]));
          }
          if (detailData.teachers.length > 0) {
            event.teamData.teachers = Array.from(new Set([...event.teamData.teachers, ...detailData.teachers]));
          }
          if (detailData.orchestras.length > 0) {
            event.teamData.orchestras = Array.from(new Set([...event.teamData.orchestras, ...detailData.orchestras]));
          }
          if (detailData.performers.length > 0) {
            event.teamData.performers = Array.from(new Set([...event.teamData.performers, ...detailData.performers]));
          }
          if (detailData.hosts.length > 0) {
            event.teamData.hosts = Array.from(new Set([...(event.teamData.hosts || []), ...detailData.hosts]));
          }

          enrichedCount++;
          console.log(`[HoyMilonga] ✅ Enriched: ${event.title}`);
        }
      } catch (error: any) {
        console.log(`[HoyMilonga] ⚠️ Failed to enrich ${event.title}: ${error.message}`);
      }
    }

    console.log(`[HoyMilonga] 📊 Enriched ${enrichedCount}/${eventsWithDetailUrls.length} events`);
    return events;
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

          // Extract time - try CSS first, then parse from text
          const timeEl = card.querySelector('[class*="time"], [class*="hora"], time, [class*="hour"]');
          let timeRange = timeEl?.textContent?.trim() || '';
          
          // If no time from CSS, try regex pattern
          const cardText = card.textContent || '';
          if (!timeRange) {
            const timeMatch = cardText.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
            if (timeMatch) {
              timeRange = `${timeMatch[1]} - ${timeMatch[2]}`;
            }
          }

          // MB.MD v9.9.3: Extract venue from text pattern "Venue Name (Neighborhood)"
          // HoyMilonga format: "22:30 - 01:00 Salón Canning (Palermo)"
          let venue = 'Unknown Venue';
          let neighborhood = '';
          
          // First try CSS selectors
          const venueEl = card.querySelector('[class*="venue"], [class*="location"], [class*="lugar"], address');
          if (venueEl?.textContent?.trim()) {
            venue = venueEl.textContent.trim();
          }
          
          const neighborhoodEl = card.querySelector('[class*="barrio"], [class*="neighborhood"], [class*="area"]');
          if (neighborhoodEl?.textContent?.trim()) {
            neighborhood = neighborhoodEl.textContent.trim();
          }
          
          // If venue not found via CSS, parse from text content
          // Pattern: looks for "Time Range VenueName (Neighborhood)"
          if (venue === 'Unknown Venue') {
            // Match venue name with neighborhood in parentheses
            const venueMatch = cardText.match(/\d{1,2}:\d{2}\s+([A-Za-zÀ-ÿ\s\-''\.]+?)\s*\(([^)]+)\)/);
            if (venueMatch) {
              venue = venueMatch[1].trim();
              neighborhood = venueMatch[2].trim();
            } else {
              // Try to find standalone location marker with text following
              const locMatch = cardText.match(/location[:\s]+([A-Za-zÀ-ÿ\s\-''\.]+?)(?:\s*\(|$)/i);
              if (locMatch) {
                venue = locMatch[1].trim();
              }
            }
          }

          // Determine event type
          const cardTextLower = cardText.toLowerCase();
          let eventType = 'milonga';
          if (cardTextLower.includes('clase') || cardTextLower.includes('class')) eventType = 'class';
          else if (cardTextLower.includes('práctica') || cardTextLower.includes('practica')) eventType = 'practica';
          else if (cardTextLower.includes('show') || cardTextLower.includes('espectáculo')) eventType = 'show';

          // Extract day if available
          const dayEl = card.closest('[data-day]') || card.querySelector('[class*="day"]');
          const day = dayEl?.getAttribute('data-day') || 
                     dayEl?.textContent?.trim().split(' ')[0] || 
                     'various';

          // MB.MD v9.9.3: Extract team data from card text
          // Patterns include accents, apostrophes, ampersands, digits for names like "D'Arienzo", "Los Reyes & Co."
          const nameChars = "[A-Za-zÀ-ÿ\\s\\-\\.''`&\\/0-9]+?";
          const teamPatterns = {
            dj: new RegExp(`(?:dj|musicalizador|musicaliza|music by|música por)[:\\s]*(${nameChars})(?:\\s*[,|\\n<]|$)`, 'gi'),
            teacher: new RegExp(`(?:clase con|class with|teacher|maestro|profesor|enseña)[:\\s]*(${nameChars})(?:\\s*[,|\\n<]|$)`, 'gi'),
            orchestra: new RegExp(`(?:orquesta|orchestra|en vivo|live)[:\\s]*(${nameChars})(?:\\s*[,|\\n<]|$)`, 'gi'),
            performer: new RegExp(`(?:show|exhibición|performance|bailan)[:\\s]*(${nameChars})(?:\\s*[,|\\n<]|$)`, 'gi')
          };

          const teamData: any = { djs: [], teachers: [], orchestras: [], performers: [] };
          for (const [role, pattern] of Object.entries(teamPatterns)) {
            const matches = Array.from(cardText.matchAll(pattern as RegExp));
            const key = role === 'dj' ? 'djs' : role === 'teacher' ? 'teachers' : role === 'orchestra' ? 'orchestras' : 'performers';
            for (const match of matches) {
              const name = match[1]?.trim();
              if (name && name.length > 2 && name.length < 50 && !teamData[key].includes(name)) {
                teamData[key].push(name);
              }
            }
          }

          // Look for detail page link - card itself may be the link
          let detailUrl: string | undefined;
          if (card.tagName === 'A' && card.getAttribute('href')?.includes('/milonga/')) {
            detailUrl = `https://hoy-milonga.com${card.getAttribute('href')}`;
          } else {
            const detailLink = card.querySelector('a[href*="/milonga/"]');
            if (detailLink?.getAttribute('href')) {
              detailUrl = `https://hoy-milonga.com${detailLink.getAttribute('href')}`;
            }
          }

          events.push({
            title,
            timeRange,
            venue,
            neighborhood,
            city: cityName,
            eventType,
            day,
            sourceUrl,
            detailUrl,
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
   * MB.MD v9.9.3: Format team data for description with title case normalization
   */
  private formatTeamDescription(teamData?: HoyMilongaTeamData): string {
    if (!teamData) return '';
    
    const titleCase = (s: string) => s.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    const parts: string[] = [];
    if (teamData.organizers?.length > 0) parts.push(`Organizers: ${teamData.organizers.map(titleCase).join(', ')}`);
    if (teamData.hosts?.length > 0) parts.push(`Hosts: ${teamData.hosts.map(titleCase).join(', ')}`);
    if (teamData.djs.length > 0) parts.push(`DJs: ${teamData.djs.map(titleCase).join(', ')}`);
    if (teamData.teachers.length > 0) parts.push(`Teachers: ${teamData.teachers.map(titleCase).join(', ')}`);
    if (teamData.orchestras.length > 0) parts.push(`Live Music: ${teamData.orchestras.map(titleCase).join(', ')}`);
    if (teamData.performers.length > 0) parts.push(`Performers: ${teamData.performers.map(titleCase).join(', ')}`);
    
    return parts.length > 0 ? `\n\nEvent Team:\n${parts.join('\n')}` : '';
  }

  /**
   * Store scraped events in database
   */
  private async storeEvents(events: HoyMilongaEvent[], sourceId: number, cityName: string): Promise<void> {
    console.log(`[HoyMilonga] 💾 Storing ${events.length} events for ${cityName}`);

    for (const event of events) {
      try {
        const matchResult = await cityMatcherService.matchEventLocation(cityName);
        const groupId = matchResult || null;

        const startDate = this.getNextDayDate(event.day);
        
        // Build description with enriched data
        const descParts = [
          event.eventType.toUpperCase(),
          event.timeRange ? `Time: ${event.timeRange}` : null,
          event.venue && event.venue !== 'Unknown Venue' ? `Venue: ${event.venue}` : null,
          event.neighborhood ? `Neighborhood: ${event.neighborhood}` : null,
          event.price ? `Price: ${event.price}` : null,
          event.status ? `Status: ${event.status}` : null,
        ].filter(Boolean);

        const baseDescription = descParts.join(' | ');
        const teamDescription = this.formatTeamDescription(event.teamData);
        const description = baseDescription + teamDescription;
        
        if (teamDescription) {
          console.log(`[HoyMilonga] 👥 Team found for: ${event.title}`);
        }

        const eventSourceUrl = event.detailUrl || event.sourceUrl;
        
        let sourceName = 'HoyMilonga';
        try {
          const url = new URL(eventSourceUrl);
          sourceName = url.hostname.replace('www.', '');
        } catch {}

        // MB.MD v9.9.3: Use enriched address data
        const address = event.fullAddress || 
          (event.neighborhood ? `${event.neighborhood}, ${cityName}` : cityName);

        // MB.MD v9.9.3: Use organizers from team data if available
        const organizer = event.teamData?.organizers?.[0] || 
          (event.venue !== 'Unknown Venue' ? event.venue : undefined);

        // Parse time range and convert from local (GMT-3) to UTC
        let eventStartDate = startDate;
        let eventEndDate = startDate;
        if (event.timeRange) {
          const timeMatch = event.timeRange.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const startHour = parseInt(timeMatch[1], 10);
            const startMin = parseInt(timeMatch[2], 10);
            const endHour = parseInt(timeMatch[3], 10);
            const endMin = parseInt(timeMatch[4], 10);
            
            eventStartDate = new Date(startDate);
            eventStartDate.setHours(startHour, startMin, 0, 0);
            
            eventEndDate = new Date(startDate);
            eventEndDate.setHours(endHour, endMin, 0, 0);
            // If end time is before start time, it's next day
            if (endHour < startHour) {
              eventEndDate.setDate(eventEndDate.getDate() + 1);
            }
            
            // Convert from GMT-3 (Buenos Aires) to UTC by adding 3 hours
            eventStartDate.setHours(eventStartDate.getHours() + 3);
            eventEndDate.setHours(eventEndDate.getHours() + 3);
          }
        }

        const participantData = await attachParticipantProfiles({
          title: event.title,
          description,
          organizer
        });

        await db.insert(scrapedEvents).values({
          sourceUrl: eventSourceUrl,
          sourceName,
          title: event.title,
          description,
          startDate: eventStartDate,
          endDate: eventEndDate,
          location: event.venue !== 'Unknown Venue' ? event.venue : undefined,
          address,
          city: cityName,
          country: this.cityCountryMap[cityName] || 'Argentina',
          organizer,
          groupId,
          imageUrl: event.coverImage || undefined,
          status: event.status === 'cancelled' ? 'rejected' : 'approved',
          externalId: `hoymilonga-${cityName}-${event.title}`.toLowerCase().replace(/\s+/g, '-').slice(0, 100),
          organizerText: participantData.organizerText,
          djText: participantData.djText,
          teacherText: participantData.teacherText,
          performerText: participantData.performerText,
          participantProfiles: participantData.participantProfiles
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
