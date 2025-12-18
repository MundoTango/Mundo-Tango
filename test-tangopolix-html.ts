import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://www.tangopolix.com/tango-events';
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  console.log('Looking for event containers...');
  
  // Try different selectors
  console.log('Articles:', $('article').length);
  console.log('div.itemContainer:', $('div.itemContainer').length);
  console.log('div.catItemView:', $('div.catItemView').length);
  console.log('div.catItemBody:', $('div.catItemBody').length);
  
  // Look for event titles
  const titles = [];
  $('h2 a, h3 a').each((i, el) => {
    const title = $(el).text().trim();
    if (title) titles.push(title);
  });
  console.log(`Found ${titles.length} titles:`, titles.slice(0, 3));
}

main();
