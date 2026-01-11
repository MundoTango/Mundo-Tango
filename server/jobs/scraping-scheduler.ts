/**
 * Scraping Scheduler Job
 * 
 * Automatically runs event scrapers on a schedule to continuously populate
 * the Mundo Tango platform with fresh event data from 244+ sources.
 * 
 * Schedule:
 * - Daily scraping + geocoding: 6 AM PST (14:00 UTC)
 * - Ingestion: After each scraping run
 * - Geocoding: After ingestion to add map coordinates
 */

import { db } from '../db';
import { eventScrapingSources, scrapedEvents, eventSeries } from '@shared/schema';
import { eq, and, sql, desc, lt, isNull, or } from 'drizzle-orm';
import { scrapedEventIngestionService } from '../services/ScrapedEventIngestionService';
import { geocodingService } from '../services/GeocodingService';
import { RecurringEventDetector } from '../services/scraping/RecurringEventDetector';

// 6 AM PST = 14:00 UTC (standard time) or 13:00 UTC (daylight saving)
// Using 14:00 UTC as the target hour
const DAILY_HOUR_UTC = 14; // 6 AM PST

interface ScrapingResult {
  source: string;
  eventsFound: number;
  success: boolean;
  error?: string;
}

/**
 * Geocode scraped events that are missing coordinates
 * Uses OpenStreetMap Nominatim (rate-limited to 1 req/sec)
 */
async function geocodeScrapedEvents(): Promise<{ geocoded: number; failed: number }> {
  console.log('[Scraping Scheduler] Starting scraped events geocoding...');
  
  let geocoded = 0;
  let failed = 0;
  
  try {
    // Get scraped events missing coordinates (any status: pending, approved, ingested)
    const eventsToGeocode = await db
      .select({
        id: scrapedEvents.id,
        title: scrapedEvents.title,
        address: scrapedEvents.address,
        location: scrapedEvents.location,
        city: scrapedEvents.city,
        country: scrapedEvents.country,
      })
      .from(scrapedEvents)
      .where(isNull(scrapedEvents.latitude))
      .limit(200); // Limit batch size for rate limiting
    
    console.log(`[Scraping Scheduler] Found ${eventsToGeocode.length} scraped events to geocode`);
    
    for (const event of eventsToGeocode) {
      try {
        // Build address from available fields
        const addressParts = [event.address, event.location].filter(Boolean);
        const address = addressParts.length > 0 ? addressParts[0] : null;
        
        if (!event.city && !address) {
          failed++;
          continue;
        }
        
        // Try geocoding
        let result = null;
        if (address) {
          result = await geocodingService.geocodeAddress(
            address as string,
            event.city,
            event.country
          );
        }
        
        if (!result && event.city) {
          result = await geocodingService.geocodeCity(
            event.city,
            event.country || undefined
          );
        }
        
        if (result) {
          await db.update(scrapedEvents)
            .set({
              latitude: result.lat.toString(),
              longitude: result.lng.toString(),
            })
            .where(eq(scrapedEvents.id, event.id));
          geocoded++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`[Scraping Scheduler] Geocoding failed for event ${event.id}:`, error);
        failed++;
      }
    }
    
    console.log(`[Scraping Scheduler] Geocoded ${geocoded} events, ${failed} failed`);
  } catch (error) {
    console.error('[Scraping Scheduler] Geocoding batch failed:', error);
  }
  
  return { geocoded, failed };
}

/**
 * Run all scrapers using the Master Scraping Orchestrator (Agent #115)
 * This coordinates all 245+ sources: Facebook, Instagram, websites, RSS, HoyMilonga, TangoCat, TangoFestivals, TangoMango
 */
async function runAllScrapers(): Promise<ScrapingResult[]> {
  const results: ScrapingResult[] = [];
  
  console.log('[Scraping Scheduler] Starting daily scraper run via Master Orchestrator...');
  
  try {
    // Import the Master Scraping Orchestrator (Agent #115)
    const { ScrapingOrchestrator } = await import('../agents/scraping/masterOrchestrator');
    const orchestrator = new ScrapingOrchestrator();
    
    // Run the full orchestration which coordinates:
    // - Agent #116: AI-Powered Static Scraper (UnifiedEventScraper)
    // - Agent #117: JS Scraper (dynamic sites)
    // - Agent #118: Social Scraper (Facebook/Instagram)
    // - RSS Feed Service
    // - HoyMilonga, TangoCat, TangoFestivals, TangoMango (Priority Scrapers)
    // - Agent #119: Deduplication
    // - Auto-city creation for new locations
    console.log('[Scraping Scheduler] 🎯 Invoking Agent #115 Master Orchestrator...');
    await orchestrator.orchestrate();
    
    results.push({ source: 'MasterOrchestrator', eventsFound: 0, success: true });
    console.log('[Scraping Scheduler] ✅ Master Orchestrator completed successfully');
    
    // Run ingestion for approved events
    const ingestionResult = await scrapedEventIngestionService.backfillApproved();
    console.log(`[Scraping Scheduler] Ingested ${ingestionResult.ingested} events, ${ingestionResult.failed} failed`);
    
    // Geocode scraped events
    const geocodeResult = await geocodeScrapedEvents();
    console.log(`[Scraping Scheduler] Geocoding complete: ${geocodeResult.geocoded} geocoded`);
    
  } catch (error: any) {
    console.error('[Scraping Scheduler] Master Orchestrator failed:', error.message);
    results.push({ source: 'MasterOrchestrator', eventsFound: 0, success: false, error: error.message });
  }
  
  return results;
}

/**
 * Get scraping statistics
 */
async function getScrapingStats() {
  const stats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      approved: sql<number>`COUNT(*) FILTER (WHERE status = 'approved')`,
      ingested: sql<number>`COUNT(*) FILTER (WHERE status = 'ingested')`,
      rejected: sql<number>`COUNT(*) FILTER (WHERE status = 'rejected')`,
    })
    .from(scrapedEvents);
  
  const sourceStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`COUNT(*) FILTER (WHERE is_active = true)`,
      neverScraped: sql<number>`COUNT(*) FILTER (WHERE last_scraped_at IS NULL AND is_active = true)`,
    })
    .from(eventScrapingSources);
  
  return {
    events: stats[0],
    sources: sourceStats[0]
  };
}

/**
 * Generate future events from all active series
 * MB.MD Pattern 67: Fill gaps like Jan 19-31 with recurring milongas
 */
async function generateFutureEventsFromSeries(): Promise<{ seriesProcessed: number; eventsGenerated: number }> {
  console.log('[Scraping Scheduler] Generating future events from active series...');
  
  try {
    // Get all active series
    const activeSeries = await db
      .select({ id: eventSeries.id, name: eventSeries.name })
      .from(eventSeries)
      .where(eq(eventSeries.isActive, true));
    
    let totalGenerated = 0;
    
    for (const series of activeSeries) {
      const generated = await RecurringEventDetector.generateFutureEvents(series.id, 8);
      if (generated > 0) {
        console.log(`[Scraping Scheduler] Series "${series.name}": ${generated} events generated`);
      }
      totalGenerated += generated;
    }
    
    console.log(`[Scraping Scheduler] Series generation complete: ${activeSeries.length} series processed, ${totalGenerated} events generated`);
    return { seriesProcessed: activeSeries.length, eventsGenerated: totalGenerated };
  } catch (error: any) {
    console.error('[Scraping Scheduler] Series generation failed:', error.message);
    return { seriesProcessed: 0, eventsGenerated: 0 };
  }
}

/**
 * Initialize the scraping scheduler
 * Daily scraping at 6 AM PST (14:00 UTC) with geocoding
 */
export function initScrapingScheduler() {
  console.log('[Scraping Scheduler] Initializing automated scraping...');
  console.log('[Scraping Scheduler] Daily scrape + geocode: 6 AM PST (14:00 UTC)');
  
  // Log initial stats
  getScrapingStats().then(stats => {
    console.log('[Scraping Scheduler] Current stats:', JSON.stringify(stats));
  }).catch(console.error);
  
  // Daily full scrape at 6 AM PST (14:00 UTC)
  scheduleDailyTask(DAILY_HOUR_UTC, async () => {
    console.log('[Scraping Scheduler] Starting daily scraping cycle at 6 AM PST...');
    const stats = await getScrapingStats();
    console.log('[Scraping Scheduler] Pre-scrape stats:', JSON.stringify(stats));
    
    // Run all scrapers + ingestion + geocoding
    const results = await runAllScrapers();
    
    // Log summary
    const totalEvents = results.reduce((sum, r) => sum + r.eventsFound, 0);
    const successCount = results.filter(r => r.success).length;
    console.log(`[Scraping Scheduler] Daily scrape complete: ${totalEvents} events from ${successCount}/${results.length} scrapers`);
    
    // Log final stats
    const postStats = await getScrapingStats();
    console.log('[Scraping Scheduler] Post-scrape stats:', JSON.stringify(postStats));
    
    // Generate future events from active series (MB.MD Pattern 67)
    await generateFutureEventsFromSeries();
  });
  
  // Run initial ingestion and geocoding check on startup (after 30 seconds)
  setTimeout(async () => {
    try {
      const stats = await getScrapingStats();
      console.log('[Scraping Scheduler] Startup stats:', JSON.stringify(stats));
      
      // Check if there are approved events waiting
      if (stats.events.approved > 0) {
        console.log(`[Scraping Scheduler] Found ${stats.events.approved} approved events, running ingestion...`);
        const result = await scrapedEventIngestionService.backfillApproved();
        console.log(`[Scraping Scheduler] Startup ingestion: ${result.ingested} ingested, ${result.failed} failed`);
      }
      
      // Also geocode any pending events without coordinates
      const geocodeResult = await geocodeScrapedEvents();
      if (geocodeResult.geocoded > 0) {
        console.log(`[Scraping Scheduler] Startup geocoding: ${geocodeResult.geocoded} geocoded`);
      }
    } catch (error) {
      console.error('[Scraping Scheduler] Startup check failed:', error);
    }
  }, 30000);
}

/**
 * Schedule a task to run at a specific hour each day (UTC)
 * Uses a flag to ensure task runs only once per day
 */
function scheduleDailyTask(hourUTC: number, task: () => Promise<void>) {
  let lastRunDate: string | null = null;
  
  const runTask = async () => {
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Only run if:
    // 1. It's the target hour (UTC)
    // 2. We haven't already run today
    if (now.getUTCHours() === hourUTC && lastRunDate !== todayDate) {
      console.log(`[Scraping Scheduler] Running daily task for ${todayDate}`);
      lastRunDate = todayDate;
      
      try {
        await task();
      } catch (error) {
        console.error('[Scraping Scheduler] Daily task failed:', error);
      }
    }
  };
  
  // Check every 15 minutes for more precise timing
  setInterval(runTask, 15 * 60 * 1000);
  
  // Also check immediately on startup
  runTask();
}
