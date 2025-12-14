import { scrapingOrchestrator } from './server/agents/scraping/masterOrchestrator.js';

console.log('🚀 Starting Mundo Tango event scraping...');
console.log('📊 Target: 194 sources across 37 countries\n');

try {
  await scrapingOrchestrator.orchestrate();
  console.log('\n✅ Scraping completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Scraping failed:', error);
  process.exit(1);
}
