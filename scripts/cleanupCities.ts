/**
 * Database Cleanup Script: Remove venue-based cities
 * 
 * This script deletes cities that were incorrectly created based on venue names
 * instead of actual city names from the cityCodeMap.
 * 
 * Valid cities from cityCodeMap:
 * - Buenos Aires, São Paulo, Berlin, Athens, Istanbul, London, Miami, Montevideo
 */

import { db } from '../shared/db';
import { groups } from '../shared/schema';
import { not, inArray } from 'drizzle-orm';

const validCityNames = [
  'buenos-aires',
  'sao-paulo', 
  'berlin',
  'athens',
  'istanbul',
  'london',
  'miami',
  'montevideo'
];

async function cleanupCities() {
  try {
    console.log('🧹 Starting city cleanup...');
    
    // Delete all groups (cities) that are NOT in the validCityNames list
    const result = await db
      .delete(groups)
      .where(not(inArray(groups.groupSlug, validCityNames)));
    
    console.log(`✅ Cleanup complete! Removed venue-based cities.`);
    console.log(`Valid cities remaining: ${validCityNames.join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupCities();
