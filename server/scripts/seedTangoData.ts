import { db } from '@shared/db';
import { events } from '@shared/schema';
import { sql } from 'drizzle-orm';

// Realistic tango venue data for each city
const venues = {
  'Buenos Aires': ['El Nacional', 'Salon Canning', 'La Viruta', 'Club Gricel', 'La Catedral', 'Parakultural'],
  'Madrid': ['Triangulo', 'Cuesta de San Vicente', 'Amor de Dios', 'La Tape', 'Berlin Tango'],
  'New York': ['Stepping Out Studios', 'Dance Manhattan', 'The Triangulo', 'Noche de Tango', 'Triangulo NYC'],
  'Tokyo': ['Tango Salon Milonga', 'Tokyo Tango Cafe', 'Shibuya Tango', 'Roppongi Tango Club'],
  'Paris': ['La Boule Noire', 'Chez Bouboule', 'Tango Nino', 'Le Tango', 'La Java'],
  'Milan': ['Spazio Tango', 'La Salumeria della Musica', 'Circolo Arci Bellezza', 'Tango Metropolis'],
  'Barcelona': ['La Tangueria', 'El Intruso', 'Casa de Andalucia', 'Salones Barcelona'],
  'Toronto': ['Casa del Tango', 'The Dovercourt House', 'Lula Lounge', 'The Beguiling'],
  'Berlin': ['Clärchens Ballhaus', 'Tango Sudaka', 'Tangoloft', 'Cafe Tango'],
  'Istanbul': ['Tango Istanbul', 'Kadikoy Tango', 'Beyoglu Tango House', 'Galata Tango']
};

// DJ and teacher names for realistic attribution
const djs = [
  'DJ Carlos Rodriguez', 'DJ Maria Gonzalez', 'DJ Pablo Martinez', 'DJ Sofia Fernandez',
  'DJ Miguel Torres', 'DJ Isabella Romano', 'DJ Diego Silva', 'DJ Valentina Lopez',
  'DJ Marco Rossi', 'DJ Lucia Moretti', 'DJ Sebastian Cruz', 'DJ Camila Reyes'
];

const teachers = [
  'Osvaldo & Maria', 'Gustavo & Giselle', 'Pablo & Noelia', 'Carlos & Rosa',
  'Diego & Carolina', 'Sebastian & Josefina', 'Maxi & Soledad', 'Fabian & Sabrina'
];

async function seedTangoData() {
  console.log('🌍 Starting Mundo Tango data seeding...\n');

  // City data with coordinates
  const cityData = [
    { name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
    { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
    { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
    { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
    { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.1900 },
    { name: 'Barcelona', country: 'Spain', latitude: 41.3851, longitude: 2.1734 },
    { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
    { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
    { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 }
  ];

  // Generate 100 realistic tango events
  console.log('💃 Creating tango events...');
  
  const today = new Date();
  const eventTypes = [
    { type: 'milonga', weight: 60, duration: 6 }, // 60% milongas, 6 hours
    { type: 'practica', weight: 20, duration: 3 }, // 20% practicas, 3 hours
    { type: 'festival', weight: 10, duration: 12 }, // 10% festivals, 12 hours
    { type: 'workshop', weight: 10, duration: 4 }  // 10% workshops, 4 hours
  ];

  let eventCount = 0;
  let milongaCount = 0;
  let practicaCount = 0;
  let festivalCount = 0;
  let workshopCount = 0;

  // Generate 10 events per city (100 total)
  for (const city of cityData) {
    const cityVenues = (venues as any)[city.name] || ['Tango Salon'];
    
    // 6 milongas, 2 practicas, 1 festival, 1 workshop per city
    const cityEvents = [
      ...Array(6).fill('milonga'),
      ...Array(2).fill('practica'),
      ...Array(1).fill('festival'),
      ...Array(1).fill('workshop')
    ];

    for (let i = 0; i < cityEvents.length; i++) {
      const eventType = cityEvents[i] as 'milonga' | 'practica' | 'festival' | 'workshop';
      const venue = cityVenues[i % cityVenues.length];
      
      // Spread events over next 6 months
      const daysFromNow = Math.floor(Math.random() * 180) + 1;
      const eventDate = new Date(today);
      eventDate.setDate(eventDate.getDate() + daysFromNow);
      
      // Set realistic times based on event type
      let startHour = 20; // Default 8pm
      let duration = 6;
      
      if (eventType === 'milonga') {
        startHour = 20; // 8pm
        duration = 6; // Until 2am
        milongaCount++;
      } else if (eventType === 'practica') {
        startHour = 19; // 7pm
        duration = 3; // Until 10pm
        practicaCount++;
      } else if (eventType === 'festival') {
        startHour = 10; // 10am
        duration = 16; // Until 2am (all day)
        festivalCount++;
      } else if (eventType === 'workshop') {
        startHour = 14; // 2pm
        duration = 4; // Until 6pm
        workshopCount++;
      }
      
      eventDate.setHours(startHour, 0, 0, 0);
      const endDate = new Date(eventDate);
      endDate.setHours(eventDate.getHours() + duration);
      
      // Generate realistic titles and descriptions
      let title = '';
      let description = '';
      let price = 0;
      
      if (eventType === 'milonga') {
        const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
        title = `${dayOfWeek} Night Milonga at ${venue}`;
        const dj = djs[Math.floor(Math.random() * djs.length)];
        description = `Join us for a traditional tango milonga with ${dj}. Elegant dress code appreciated. Warm-up class at 8pm, dancing from 9pm-2am. Classic tango, vals, and milonga music. Shoe rental available.`;
        price = 15;
      } else if (eventType === 'practica') {
        title = `Tuesday Practica - ${venue}`;
        description = `Practice session focused on technique and musicality. All levels welcome. Guided exercises for the first hour, then free practice. Work on your ochos, giros, and musicality in a supportive environment.`;
        price = 10;
      } else if (eventType === 'festival') {
        title = `${city.name} Tango Festival ${eventDate.getFullYear()}`;
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        description = `3-day international tango festival featuring workshops with ${teacher}, nightly milongas, live orchestra performances, and tango shows. All-access pass includes 12 workshops and 3 milongas. Special rate for early registration.`;
        price = 150;
      } else if (eventType === 'workshop') {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const topics = ['Musicality', 'Giros & Volcadas', 'Sacadas & Enrosques', 'Vals Technique', 'Milonga Rhythm'];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        title = `${topic} Workshop with ${teacher}`;
        description = `Intensive 4-hour workshop focusing on ${topic.toLowerCase()}. Intermediate/advanced level. Limited to 12 couples. Includes theory, technique drills, and guided practice. Bring your dance shoes!`;
        price = 50;
      }
      
      // Insert event
      try {
        await db.insert(events).values({
          userId: 15, // Current user as event creator
          title,
          description,
          eventType: eventType,
          startDate: eventDate,
          endDate: endDate,
          city: city.name,
          country: city.country,
          address: `${venue}, ${city.name}`,
          venue: venue,
          organizerId: 1, // Default organizer
          capacity: eventType === 'festival' ? 500 : eventType === 'workshop' ? 24 : 100,
          price: price,
          currency: 'USD',
          isPublic: true,
          requiresRsvp: true,
          status: 'published',
          categoryId: 1, // Default category
          tags: [eventType, city.name.toLowerCase().replace(' ', '-'), 'tango'],
          imageUrl: null
        });
        
        eventCount++;
        console.log(`  ✅ Created: ${title} (${eventDate.toLocaleDateString()})`);
      } catch (error) {
        console.error(`  ❌ Failed to create event: ${title}`, error);
      }
    }
  }

  console.log(`\n✨ Seeding complete!\n`);
  console.log(`📊 Summary:`);
  console.log(`  - Total events created: ${eventCount}`);
  console.log(`  - Milongas: ${milongaCount}`);
  console.log(`  - Practicas: ${practicaCount}`);
  console.log(`  - Festivals: ${festivalCount}`);
  console.log(`  - Workshops: ${workshopCount}`);
  console.log(`  - Cities covered: ${cityData.length}`);
  console.log(`\n🎉 Your platform now has realistic tango event data!`);
  console.log(`\n👉 Next steps:`);
  console.log(`  1. Navigate to /events to see all events`);
  console.log(`  2. Navigate to /tango-community to see all city groups`);
  console.log(`  3. RSVP to events and test the platform`);
}

// Run the seed
seedTangoData()
  .then(() => {
    console.log('\n✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  });
