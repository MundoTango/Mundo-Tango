/**
 * AGENT #115: MASTER SCRAPING ORCHESTRATOR
 * MB.MD Implementation - Simultaneously, Recursively, Critically
 * 
 * Responsibilities:
 * - Schedule scraping jobs every 24 hours (4 AM UTC)
 * - Coordinate Agents #116, #117, #118
 * - Manage proxy rotation system
 * - Monitor scraping health
 * - Trigger deduplication (Agent #119)
 * - Auto-create cities when new locations detected
 */

import { db } from '@shared/db';
import { eventScrapingSources, scrapedEvents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export class ScrapingOrchestrator {
  private isRunning = false;
  private activeJobs = new Map<number, Promise<any>>();

  /**
   * Main orchestration loop
   */
  async orchestrate(): Promise<void> {
    if (this.isRunning) {
      console.log('[Agent #115] Scraping already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('[Agent #115] 🎯 Starting global scraping orchestration...');

    try {
      // Step 1: Fetch all active scraping sources (226+ communities)
      const sources = await db.query.eventScrapingSources.findMany({
        where: eq(eventScrapingSources.isActive, true)
      });

      console.log(`[Agent #115] Found ${sources.length} active sources to scrape`);

      // Step 2: Group sources by scraper type
      const facebookSources = sources.filter(s => s.platform === 'facebook');
      const instagramSources = sources.filter(s => s.platform === 'instagram');
      const websiteSources = sources.filter(s => s.platform === 'website');
          const hoyMilongaSources = sources.filter(s => s.scraperType === 'hoy-milonga');
      const eventPlatformSources = sources.filter(s => ['eventbrite', 'meetup'].includes(s.platform || ''));
      const rssSources = sources.filter(s => s.platform === 'rss' || s.rssUrl);

      // Step 3: Execute scraping in parallel batches
      const results = await Promise.allSettled([
        this.scrapeSourceBatch(facebookSources, 'agent-118'), // Social Scraper
        this.scrapeSourceBatch(instagramSources, 'agent-118'), // Social Scraper
        this.scrapeSourceBatch(websiteSources, 'agent-116'), // Static Scraper
        this.scrapeSourceBatch(eventPlatformSources, 'agent-117'), // JS Scraper
        this.scrapeSourceBatch(rssSources, 'rss-service') // RSS Feed Service,
        this.scrapeHoyMilongaSources(hoyMilongaSources) // Hoy Milonga Scraper,
        this.invokePriorityScrapers() // Priority scrapers (HoyMilonga, TangoCat, TangoFestivals),
      ]);

      // Step 4: Collect statistics
      const totalScraped = results
        .filter(r => r.status === 'fulfilled')
        .reduce((sum, r: any) => sum + (r.value || 0), 0);

      console.log(`[Agent #115] ✅ Scraping complete! Total events: ${totalScraped}`);

      // Step 5: Trigger deduplication (Agent #119)
      await this.triggerDeduplication();

      // Step 6: Auto-create cities for new locations
      await this.autoCreateCities();

    } catch (error) {
      console.error('[Agent #115] ❌ Orchestration failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Scrape a batch of sources using specified agent
   */
  private async scrapeSourceBatch(sources: any[], agentId: string): Promise<number> {
    if (sources.length === 0) return 0;

    console.log(`[Agent #115] Dispatching ${sources.length} sources to ${agentId}...`);

    let eventsScraped = 0;

    for (const source of sources) {
      try {
        // Determine which scraper to use
        let result;
        if (agentId === 'agent-116') {
          result = await this.invokeStaticScraper(source);
        } else if (agentId === 'agent-117') {
          result = await this.invokeJSScraper(source);
        } else if (agentId === 'agent-118') {
          result = await this.invokeSocialScraper(source);
        } else if (agentId === 'rss-service') {
          result = await this.invokeRSSScraper(source);
        }

        eventsScraped += result || 0;

        // Update last scraped timestamp
        await db.update(eventScrapingSources)
          .set({ 
            lastScrapedAt: new Date(),
            totalEventsScraped: (source.totalEventsScraped || 0) + (result || 0)
          })
          .where(eq(eventScrapingSources.id, source.id));

      } catch (error) {
        console.error(`[Agent #115] Failed to scrape ${source.name}:`, error);
        // Continue with next source
      }
    }

    return eventsScraped;
  }

  /**
   * Invoke Agent #116: Static Scraper
   */
  private async invokeStaticScraper(source: any): Promise<number> {
    const { staticScraper } = await import('./staticScraper');
    console.log(`[Agent #115 → #116] Scraping static site: ${source.name}`);
    return await staticScraper.scrape(source);
  }

  /**
   * Invoke Agent #117: JS Scraper
   */
  private async invokeJSScraper(source: any): Promise<number> {
    const { jsScraper } = await import('./jsScraper');
    console.log(`[Agent #115 → #117] Scraping dynamic site: ${source.name}`);
    return await jsScraper.scrape(source);
  }

  /**
   * Invoke Agent #118: Social Scraper
   */
  private async invokeSocialScraper(source: any): Promise<number> {
    const { socialScraper } = await import('./socialScraper');
    console.log(`[Agent #115 → #118] Scraping social platform: ${source.name}`);
    return await socialScraper.scrape(source);
  }

  /**
   * Invoke RSS Feed Service
   */
  private async invokeRSSScraper(source: any): Promise<number> {
    const { rssFeedService } = await import('../../services/scraping/RSSFeedService');
    console.log(`[Agent #115 → RSS] Scraping RSS feed: ${source.name}`);
    return await rssFeedService.scrapeRSSSource(source);
  }

  /**

   */
  private async scrapeHoyMilongaSources(sources: any[]): Promise<number> {
    if (sources.length === 0) return 0;
    
    console.log(`[Agent #115] Dispatching ${sources.length} Hoy Milonga sources...`);
    
    const { hoyMilongaScraper } = await import('./HoyMilongaScraper');
    let totalEvents = 0;
    
    // Group sources by city to avoid duplicate scraping
    const citiesProcessed = new Set<string>();
    
    for (const source of sources) {
      try {
        const city = source.city;
        
        // Skip if we've already processed this city
        if (citiesProcessed.has(city)) {
          console.log(`[Agent #115] Skipping ${city} - already processed`);
          continue;
        }
        
        console.log(`[Agent #115 → HoyMilonga] Scraping ${city}...`);
        
        // HoyMilongaScraper handles city-specific scraping
        const cityCode = this.getCityCode(city);
        if (!cityCode) {
          console.warn(`[Agent #115] No city code mapping for ${city}`);
          continue;
        }
        
        const events = await hoyMilongaScraper.scrapeCity(city, cityCode, source.id);
        totalEvents += events;
        citiesProcessed.add(city);
        
        // Update last scraped timestamp
        await db.update(eventScrapingSources)
          .set({ 
            lastScrapedAt: new Date(),
            totalEventsScraped: (source.totalEventsScraped || 0) + events
          })
          .where(eq(eventScrapingSources.id, source.id));
          
      } catch (error) {
        console.error(`[Agent #115] Failed to scrape Hoy Milonga ${source.city}:`, error);
      }
    }
    
    console.log(`[Agent #115] Hoy Milonga scraping complete: ${totalEvents} events`);
    return totalEvents;
  }
  
  /**
   * Get city code for Hoy Milonga URL
   */
  private getCityCode(cityName: string): string | null {
    const cityCodeMap: Record<string, string> = {
      'Buenos Aires': 'buenos-aires',
      'São Paulo': 'sao-paulo',
      'Berlin': 'berlin',
      'Athens': 'athens',
      'Istanbul': 'istanbul',
      'London': 'london',
      'Miami': 'miami',
      'Montevideo': 'montevideo'
    };
    return cityCodeMap[cityName] || null;
  }

   * These are high-value sources that run every orchestration cycle
   */
  private async invokePriorityScrapers(): Promise<number> {
    console.log('[Agent #115] 🌟 Running priority scrapers...');
    let totalEvents = 0;

    try {
      // Get or create source IDs for priority scrapers
      const prioritySources = await this.ensurePrioritySourcesExist();

      // Run HoyMilonga Scraper
      try {
        const { hoyMilongaScraper } = await import('./HoyMilongaScraper');
        const hoyMilongaEvents = await hoyMilongaScraper.scrapeAllCities(prioritySources.hoyMilonga);
        totalEvents += hoyMilongaEvents;
        console.log(`[Agent #115] HoyMilonga: ${hoyMilongaEvents} events`);
      } catch (err) {
        console.error('[Agent #115] HoyMilonga scraper failed:', err);
      }

      // Run TangoCat Scraper
      try {
        const { tangoCatScraper } = await import('./TangoCatScraper');
        const tangoCatEvents = await tangoCatScraper.scrapeAllYears(prioritySources.tangoCat);
        totalEvents += tangoCatEvents;
        console.log(`[Agent #115] TangoCat: ${tangoCatEvents} events`);
      } catch (err) {
        console.error('[Agent #115] TangoCat scraper failed:', err);
      }

      // Run TangoFestivals Scraper
      try {
        const { tangoFestivalsScraper } = await import('./TangoFestivalsScraper');
        const tangoFestivalsEvents = await tangoFestivalsScraper.scrapeAllEvents(prioritySources.tangoFestivals);
        totalEvents += tangoFestivalsEvents;
        console.log(`[Agent #115] TangoFestivals: ${tangoFestivalsEvents} events`);
      } catch (err) {
        console.error('[Agent #115] TangoFestivals scraper failed:', err);
      }

      console.log(`[Agent #115] 🌟 Priority scrapers complete: ${totalEvents} total events`);
    } catch (error) {
      console.error('[Agent #115] Priority scrapers failed:', error);
    }

    return totalEvents;
  }

  /**
   * Ensure priority source records exist in database
   */
  private async ensurePrioritySourcesExist(): Promise<{ hoyMilonga: number; tangoCat: number; tangoFestivals: number }> {
    const sources = {
      hoyMilonga: { name: 'Hoy Milonga', url: 'https://hoy-milonga.com', platform: 'website' },
      tangoCat: { name: 'TangoCat', url: 'https://tangocat.net', platform: 'website' },
      tangoFestivals: { name: 'TangoFestivals.net', url: 'https://tangofestivals.net', platform: 'website' }
    };

    const result: { hoyMilonga: number; tangoCat: number; tangoFestivals: number } = { hoyMilonga: 0, tangoCat: 0, tangoFestivals: 0 };

    for (const [key, source] of Object.entries(sources)) {
      let existing = await db.query.eventScrapingSources.findFirst({
        where: eq(eventScrapingSources.name, source.name)
      });

      if (!existing) {
        const [created] = await db.insert(eventScrapingSources).values({
          name: source.name,
          url: source.url,
          platform: source.platform,
          scraperType: 'static',
          isActive: true,
          priority: 'critical',
        }).returning();
        existing = created;
      }

      result[key as keyof typeof result] = existing.id;
    }

    return result;
  }

  /**
   * Trigger Agent #119: Deduplication
   */
  private async triggerDeduplication(): Promise<void> {
    const { deduplicator } = await import('./deduplicator');
    console.log('[Agent #115 → #119] Triggering event deduplication...');
    await deduplicator.deduplicate();
  }

  /**
   * Auto-create cities for new locations detected in scraped events
   */
  private async autoCreateCities(): Promise<void> {
    console.log('[Agent #115] Auto-creating cities from scraped locations...');
    
    try {
      const { db } = await import('@shared/db');
      const { scrapedEvents, groups } = await import('@shared/schema');
      const { ensureCityGroupExists } = await import('../../utils/cityGroupAutomation');
      const { eq, and, isNull, sql } = await import('drizzle-orm');
      
      // Get distinct cities from scraped events that don't have groups yet
      const eventsWithLocations = await db
        .selectDistinct({
          location: scrapedEvents.location,
        })
        .from(scrapedEvents)
        .where(
          and(
            sql`${scrapedEvents.location} IS NOT NULL`,
            eq(scrapedEvents.status, 'pending_review')
          )
        )
        .limit(50);
      
      const processedCities = new Set<string>();
      let createdCount = 0;
      
      for (const event of eventsWithLocations) {
        if (!event.location) continue;
        
        // Parse city from location string (typically "Venue, Neighborhood, City" or "Venue, City")
        const parts = event.location.split(',').map(p => p.trim());
        const city = parts[parts.length - 1] || parts[parts.length - 2];
        
        if (!city || processedCities.has(city.toLowerCase())) continue;
        processedCities.add(city.toLowerCase());
        
        // Try to determine country from known city mappings
        const cityCountryMap: Record<string, string> = {
          'buenos aires': 'Argentina',
          'montevideo': 'Uruguay',
          'berlin': 'Germany',
          'london': 'United Kingdom',
          'paris': 'France',
          'new york': 'United States',
          'miami': 'United States',
          'athens': 'Greece',
          'istanbul': 'Turkey',
          'são paulo': 'Brazil',
          'sao paulo': 'Brazil',
        };
        
        const country = cityCountryMap[city.toLowerCase()] || 'Unknown';
        
        if (country !== 'Unknown') {
          const result = await ensureCityGroupExists(city, country, 1); // System user ID 1
          if (result?.wasCreated) {
            createdCount++;
            console.log(`[Agent #115] Created city group: ${result.groupName}`);
          }
        }
      }
      
      console.log(`[Agent #115] Auto-created ${createdCount} new city groups`);
    } catch (error) {
      console.error('[Agent #115] Failed to auto-create cities:', error);
    }
  }

  /**
   * Get orchestration status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.activeJobs.size,
      lastRun: null // TODO: Track last run timestamp
    };
  }
}

// Export singleton instance
export const scrapingOrchestrator = new ScrapingOrchestrator();
