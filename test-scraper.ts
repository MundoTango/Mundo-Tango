import { TangopolixScraper } from './server/services/scrapers/TangopolixScraper';

async function main() {
  console.log('Starting Tangopolix scraper test...');
  const scraper = new TangopolixScraper();
  await scraper.run();
  console.log('Scraper test completed!');
  process.exit(0);
}

main().catch(error => {
  console.error('Error running scraper:', error);
  process.exit(1);
});
