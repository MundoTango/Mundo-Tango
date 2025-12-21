/**
 * Ingest approved scraped events to main events table
 */

import { scrapedEventIngestionService } from '../services/ScrapedEventIngestionService';

async function main() {
  console.log('========================================');
  console.log('INGESTING APPROVED SCRAPED EVENTS');
  console.log('========================================\n');
  
  try {
    const result = await scrapedEventIngestionService.backfillApproved();
    console.log('\n========================================');
    console.log('INGESTION COMPLETE');
    console.log('========================================');
    console.log(`Ingested: ${result.ingested}`);
    console.log(`Failed: ${result.failed}`);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);
