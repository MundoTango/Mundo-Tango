/**
 * Direct Scraping and Ingestion Script
 * Bypasses API layer to run scraping on all active sources and ingest approved events
 * Usage: npx tsx server/scripts/runScrapingNow.ts
 */

import { ScrapingOrchestrator } from '../agents/scraping/masterOrchestrator';
import { scrapedEventIngestionService } from '../services/ScrapedEventIngestionService';
import { db } from '@shared/db';
import { eventScrapingSources, scrapedEvents } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  console.log('='.repeat(60));
  console.log('MUNDO TANGO - SCRAPING & INGESTION RUNNER');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}\n`);

  // Step 1: Check current status
  console.log('📊 CURRENT STATUS:');
  
  const scrapedCounts = await db.execute(sql`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'ingested') as ingested,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) as total
    FROM scraped_events
  `);
  console.log('  Scraped Events:', scrapedCounts.rows?.[0] || scrapedCounts);

  const sources = await db.query.eventScrapingSources.findMany({
    where: eq(eventScrapingSources.isActive, true)
  });
  console.log(`  Active Sources: ${sources.length}`);

  const neverScraped = sources.filter(s => !s.lastScrapedAt).length;
  console.log(`  Never Scraped: ${neverScraped}`);

  // Step 2: Ingest approved events first
  console.log('\n📥 INGESTING APPROVED EVENTS...');
  try {
    const ingestStart = Date.now();
    const ingestResult = await scrapedEventIngestionService.backfillApproved();
    const ingestDuration = ((Date.now() - ingestStart) / 1000).toFixed(1);
    console.log(`  ✅ Ingested ${ingestResult.ingested} events in ${ingestDuration}s`);
    if (ingestResult.failed > 0) {
      console.log(`  ❌ Failed: ${ingestResult.failed}`);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('  ❌ Ingestion error:', msg);
  }

  // Step 3: Run scraping on all sources
  console.log('\n🔄 STARTING SCRAPING ORCHESTRATION...');
  console.log(`  Processing ${sources.length} active sources`);
  console.log('  This will run in the background...\n');

  const orchestrator = new ScrapingOrchestrator();
  const status = orchestrator.getStatus();
  if (status.isRunning) {
    console.log('  ⚠️  Scraping already in progress!');
    console.log('  Status:', status);
  } else {
    // Start orchestration (runs async)
    orchestrator.orchestrate().then(() => {
      console.log('\n✅ Scraping orchestration completed!');
    }).catch((error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('\n❌ Scraping error:', msg);
    });
    
    console.log('  ✅ Scraping initiated!');
    console.log('  Monitor progress with: GET /api/admin/scraping-status');
  }

  console.log('\n' + '='.repeat(60));
  console.log('Script execution started - scraping running in background');
  console.log('='.repeat(60));
}

main().catch(console.error);
