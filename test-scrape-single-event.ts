import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Geocoding function using OpenStreetMap Nominatim (free, no API key needed)
async function geocodeCity(cityName: string) {
  try {
    console.log(`Geocoding city: ${cityName}`);
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cityName,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'MundoTango/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log(`Found coordinates: ${result.lat}, ${result.lon}`);
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Test scraper: scrape ONE event from a real source
async function testScrapeSingleEvent() {
  console.log('=== TEST SCRAPER: Single Event with Proper City ===\n');
  
  // SIMULATED scraped event data (in real scraper, this comes from web scraping)
  // Using Lyon, France as test city (not currently on map)
  const scrapedEvent = {
    title: 'Milonga at Le Tango',
    description: 'Weekly milonga with live orchestra',
    event_date: '2025-12-25T21:00:00Z',
    event_type: 'milonga' as const,
    venue_name: 'Le Tango Dance Studio',
    // CRITICAL: This should be CITY, not venue name
    location: 'Lyon, France',  
    source_url: 'https://example-tango-lyon.com/events',
    price: '€10',
    organizer_name: 'Lyon Tango Association',
    scraped_from: 'test-single-scraper'
  };

  console.log('Step 1: Scraped event data:');
  console.log(JSON.stringify(scrapedEvent, null, 2));
  console.log('');

  // Step 2: Extract city from location
  const cityName = scrapedEvent.location; // In real scraper, parse this properly
  console.log(`Step 2: Extracted city name: "${cityName}"\n`);

  // Step 3: Geocode the city
  console.log('Step 3: Geocoding city...');
  const geocoded = await geocodeCity(cityName);
  
  if (!geocoded) {
    console.error('❌ Failed to geocode city. Aborting.');
    return;
  }
  
  console.log(`✅ Geocoded: ${geocoded.displayName}`);
  console.log(`   Coordinates: ${geocoded.latitude}, ${geocoded.longitude}\n`);

  // Step 4: Check if city exists, if not create it WITH coordinates
  console.log('Step 4: Checking if city exists in database...');
  let { data: existingCity } = await supabase
    .from('cities')
    .select('*')
    .eq('name', cityName)
    .single();

  let cityId: string;

  if (existingCity) {
    console.log(`Found existing city: ${existingCity.name}`);
    console.log(`Current coordinates: lat=${existingCity.latitude}, lng=${existingCity.longitude}`);
    
    // Update coordinates if they're null
    if (!existingCity.latitude || !existingCity.longitude) {
      console.log('Updating city with geocoded coordinates...');
      const { error: updateError } = await supabase
        .from('cities')
        .update({
          latitude: geocoded.latitude,
          longitude: geocoded.longitude
        })
        .eq('id', existingCity.id);
      
      if (updateError) {
        console.error('Error updating city:', updateError);
        return;
      }
      console.log('✅ City coordinates updated');
    }
    cityId = existingCity.id;
  } else {
    console.log('City not found. Creating new city WITH coordinates...');
    const { data: newCity, error: cityError } = await supabase
      .from('cities')
      .insert([{
        name: cityName,
        country: cityName.split(',').pop()?.trim() || 'Unknown',
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        auto_created: false
      }])
      .select()
      .single();

    if (cityError) {
      console.error('❌ Error creating city:', cityError);
      return;
    }
    
    console.log(`✅ Created city: ${newCity.name}`);
    console.log(`   ID: ${newCity.id}`);
    console.log(`   Coordinates: ${newCity.latitude}, ${newCity.longitude}`);
    cityId = newCity.id;
  }
  
  console.log('');

  // Step 5: Insert the event with proper city_id and coordinates
  console.log('Step 5: Inserting event into database...');
  const { data: insertedEvent, error: eventError } = await supabase
    .from('events')
    .insert([{
      ...scrapedEvent,
      event_date: new Date(scrapedEvent.event_date).toISOString(),
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      city_id: cityId,
      status: 'active'
    }])
    .select()
    .single();

  if (eventError) {
    console.error('❌ Error inserting event:', eventError);
    return;
  }

  console.log('\n✅ ✅ ✅ TEST COMPLETE! ✅ ✅ ✅\n');
  console.log('Event inserted successfully:');
  console.log(`  Event ID: ${insertedEvent.id}`);
  console.log(`  Title: ${insertedEvent.title}`);
  console.log(`  City ID: ${insertedEvent.city_id}`);
  console.log(`  Coordinates: ${insertedEvent.latitude}, ${insertedEvent.longitude}`);
  console.log('');
  console.log('NOW VERIFY:');
  console.log('1. Go to /events - should see "Milonga at Le Tango"');
  console.log('2. Go to /community-world-map - should see Lyon, France marker');
  console.log('');
}

testScrapeSingleEvent()
  .catch(console.error)
  .finally(() => process.exit());
