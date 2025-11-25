/**
 * MB.MD Script: Enrich City Groups and Trigger Scraping
 * Assigns cityscape photos to all city groups and starts scraping orchestration
 */

import { db } from '@shared/db';
import { groups } from '@shared/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { assignCityscapeToCommunity } from '../algorithms/cityCityscape';

async function enrichCityGroups() {
  console.log('🏙️ Enriching city groups with cityscape photos...\n');

  // Get all city groups without cover images
  const cityGroups = await db.query.groups.findMany({
    where: and(
      eq(groups.type, 'city'),
      isNull(groups.coverImage)
    ),
  });

  console.log(`Found ${cityGroups.length} city groups without cover photos\n`);

  let updated = 0;
  for (const group of cityGroups) {
    const cityName = group.city || group.name;
    const cityscape = assignCityscapeToCommunity(cityName);
    
    if (cityscape.coverPhotoUrl) {
      await db.update(groups)
        .set({
          coverImage: cityscape.coverPhotoUrl,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, group.id));
      
      console.log(`✅ ${cityName}: ${cityscape.coverPhotoUrl.substring(0, 60)}...`);
      updated++;
    }
  }

  console.log(`\n🎉 Updated ${updated} city groups with cityscape photos\n`);
  return updated;
}

async function triggerScraping() {
  console.log('🕷️ Triggering scraping orchestration...\n');
  
  const { scrapingOrchestrator } = await import('../agents/scraping/masterOrchestrator');
  
  const status = scrapingOrchestrator.getStatus();
  if (status.isRunning) {
    console.log('⚠️ Scraping already in progress, skipping...');
    return;
  }

  console.log('🚀 Starting scraping orchestration (runs in background)...');
  
  // Start scraping asynchronously
  scrapingOrchestrator.orchestrate()
    .then(() => console.log('✅ Scraping completed successfully!'))
    .catch(err => console.error('❌ Scraping failed:', err));
  
  console.log('📊 Check /api/admin/scraping-status for progress\n');
}

async function main() {
  console.log('='.repeat(60));
  console.log('MB.MD CITY GROUP ENRICHMENT + SCRAPING WORKFLOW');
  console.log('='.repeat(60));
  console.log();

  try {
    // Step 1: Enrich city groups with cityscapes
    await enrichCityGroups();

    // Step 2: Trigger scraping (website scraping only - no Facebook token)
    await triggerScraping();

    console.log('='.repeat(60));
    console.log('✅ WORKFLOW INITIATED SUCCESSFULLY');
    console.log('='.repeat(60));
    
    // Keep process alive for background scraping
    console.log('\n⏳ Waiting 5 seconds for initial scraping...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ Workflow failed:', error);
    process.exit(1);
  }
}

main();
