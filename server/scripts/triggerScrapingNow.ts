import { scrapingOrchestrator } from '../agents/scraping/masterOrchestrator';

async function triggerScraping() {
  console.log('🚀 Manually triggering scraping workflow...');
  console.log('⏰ Started at:', new Date().toISOString());
  
  try {
    const status = scrapingOrchestrator.getStatus();
    
    if (status.isRunning) {
      console.log('⚠️  Scraping already in progress!');
      console.log('Active jobs:', status.activeJobs);
      return;
    }

    console.log('📊 Initiating orchestration workflow...');
    await scrapingOrchestrator.orchestrate();
    
    console.log('✅ Scraping completed successfully!');
    console.log('⏰ Finished at:', new Date().toISOString());
    
    const finalStatus = scrapingOrchestrator.getStatus();
    console.log('\n📈 Final Status:', finalStatus);
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    throw error;
  }
}

triggerScraping()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
