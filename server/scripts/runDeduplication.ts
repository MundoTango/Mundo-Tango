import { deduplicator } from '../agents/scraping/deduplicator';
import { db } from '@shared/db';
import { scrapedEvents } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function runDeduplication() {
  console.log('🔍 Running deduplication on scraped events...');
  
  try {
    // Check how many scraped events we have
    const allScraped = await db.query.scrapedEvents.findMany();
    const unprocessed = allScraped.filter(e => !e.processed);
    
    console.log(`📊 Total scraped events: ${allScraped.length}`);
    console.log(`📊 Unprocessed events: ${unprocessed.length}`);
    
    if (unprocessed.length === 0) {
      console.log('✅ All events already processed!');
      return;
    }
    
    // Run deduplication
    await deduplicator.deduplicate();
    
    console.log('✅ Deduplication complete!');
    
    // Show final stats
    const processed = await db.query.scrapedEvents.findMany({
      where: eq(scrapedEvents.processed, true)
    });
    
    console.log(`\n📈 Final Stats:`);
    console.log(`   Processed: ${processed.length}`);
    console.log(`   Pending: ${allScraped.length - processed.length}`);
    
  } catch (error) {
    console.error('❌ Deduplication failed:', error);
    throw error;
  }
}

runDeduplication()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
