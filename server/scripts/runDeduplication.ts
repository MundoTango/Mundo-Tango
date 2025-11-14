import { deduplicator } from '../agents/scraping/deduplicator';

async function runDeduplication() {
  console.log('🔍 Running deduplication...');
  
  try {
    await deduplicator.deduplicate();
    console.log('✅ Complete!');
  } catch (error) {
    console.error('❌ Failed:', error);
    throw error;
  }
}

runDeduplication()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
