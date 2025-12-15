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
import { not, inArray } from 'drizzle-orm, sql';

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
        const result = await db.execute(sql`
      DELETE FROM groups 
      WHERE group_slug NOT IN (${sql.join(validCityNames.map(name => sql`${name}`), sql`, `)})
    `);