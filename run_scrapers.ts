#!/usr/bin/env tsx
/**
 * Scraper Runner - Executes the master orchestrator to scrape all sources
 */

import { scrapingOrchestrator } from './server/agents/scraping/masterOrchestrator';

async function main() {
  console.log('🚀 Starting Mundo Tango Scraper System...');
  console.log('📊 This will scrape 120+ sources across 60+ countries\n');
  
  try {
    // Run the orchestrator
    await scrapingOrchestrator.orchestrate();
    
    // Get status
    const status = scrapingOrchestrator.getStatus();
    console.log('\n✅ Scraping completed!');
    console.log('📈 Status:', JSON.stringify(status, null, 2));
    
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    process.exit(1);
  }
}

main();
