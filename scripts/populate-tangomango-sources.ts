import { db } from '../server/db';
import { eventScrapingSources } from '../shared/schema';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

async function populateTangoMangoSources() {
  console.log('Populating TangoMango scraping sources...');
  
  const sources = US_STATES.map(state => ({
    name: `TangoMango - ${state}`,
    url: `https://www.tangomango.org/calendar.php?state=${state}`,
    platform: 'tangomango',
    city: state,
    scraperType: 'dynamic',
    active: true,
    lastScraped: new Date()
  }));

  await db.insert(eventScrapingSources).values(sources).onConflictDoNothing();
  
  console.log(`✅ Inserted ${sources.length} TangoMango sources`);
  process.exit(0);
}

populateTangoMangoSources().catch(console.error);
