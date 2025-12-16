import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Test: Insert ONE event directly with explicit city name
async function testSingleEventScraper() {
  console.log('Starting single event test scraper...');
  
  // For Lyon, France - let's use known coordinates
  const lyonLat = 45.7640;
  const lyonLng = 4.8357;
  
  console.log('Step 1: Find or create Lyon city...');
  
  // Check if Lyon exists in cities
  let { data: existingCity } = await supabase
    .from('cities')
    .select('*')
    .ilike('full_name', '%Lyon%')
    .single();
  
  let cityId;
  
  if (existingCity) {
    console.log('Lyon city found:', existingCity);
    cityId = existingCity.id;
  } else {
    console.log('Lyon city not found, creating it...');
    const { data: newCity, error: cityError } = await supabase
      .from('cities')
      .insert([{
        full_name: 'Lyon, Auvergne-Rhône-Alpes, France',
        city_name: 'Lyon',
        state: 'Auvergne-Rhône-Alpes',
        country: 'France',
        latitude: lyonLat,
        longitude: lyonLng,
        has_skyline: false
      }])
      .select()
      .single();
    
    if (cityError) {
      console.error('Error creating city:', cityError);
      return;
    }
    console.log('Created Lyon city:', newCity);
    cityId = newCity.id;
  }
  
  console.log('Step 2: Creating test event...');
  
  const testEvent = {
    title: 'Test Milonga Lyon',
    description: 'A test tango milonga in Lyon to verify city detection',
    event_date: new Date('2025-12-20T20:00:00Z').toISOString(),
    event_type: 'milonga',
    venue_name: 'Salle de Tango Lyon',
    location: 'Lyon, France',
    source_url: 'https://test-source.com/lyon-event',
    price: 'Free',
    organizer_name: 'Lyon Tango Association',
    scraped_from: 'test-scraper',
    latitude: lyonLat,
    longitude: lyonLng,
    city_id: cityId,
    status: 'active'
  };

  console.log('Test event:', testEvent);
  
  const { data: insertedEvent, error } = await supabase
    .from('events')
    .insert([testEvent])
    .select()
    .single();

  if (error) {
    console.error('Error inserting event:', error);
    return;
  }

  console.log('\n✅ Event inserted successfully!');
  console.log('Event ID:', insertedEvent.id);
  console.log('City ID:', insertedEvent.city_id);
  console.log('Coordinates:', insertedEvent.latitude, insertedEvent.longitude);
  console.log('\n✅ TEST COMPLETE');
  console.log('Now check:');
  console.log('1. /events page - should show "Test Milonga Lyon"');
  console.log('2. /community-world-map - should show Lyon, France marker');
}

testSingleEventScraper().catch(console.error).finally(() => process.exit());
