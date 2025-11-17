import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Import Wix waitlist contacts to production database
 * 
 * Expected CSV columns (Wix export format):
 * - email / Email / Email Address
 * - name / Name / Full Name / First Name
 * - createdDate / Created Date / Date
 * - labels / Labels / Tags
 * 
 * Creates users with:
 * - waitlist: true flag
 * - waitlistDate: from CSV or now
 * - source: 'wix'
 */

interface WixContact {
  email?: string;
  Email?: string;
  'Email Address'?: string;
  name?: string;
  Name?: string;
  'Full Name'?: string;
  'First Name'?: string;
  createdDate?: string;
  'Created Date'?: string;
  Date?: string;
  labels?: string;
  Labels?: string;
  Tags?: string;
}

async function importWixWaitlist() {
  const csvPath = 'attached_assets/wix_waitlist.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    console.log('📥 Please upload the CSV file from Wix to attached_assets/wix_waitlist.csv');
    process.exit(1);
  }
  
  console.log('📂 Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  console.log('📊 Parsing CSV...');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as WixContact[];
  
  console.log(`✅ Found ${records.length} contacts in CSV`);
  
  if (records.length === 0) {
    console.error('❌ No records found in CSV');
    process.exit(1);
  }
  
  // Show sample of first record for debugging
  console.log('\n📄 Sample record (first row):');
  console.log(JSON.stringify(records[0], null, 2));
  
  console.log('\n🚀 Starting import...\n');
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const [index, record] of records.entries()) {
    // Extract email (try multiple possible column names)
    const email = record.email || record.Email || record['Email Address'];
    
    if (!email || !email.includes('@')) {
      console.log(`⚠️  Row ${index + 1}: Skipping - no valid email`);
      skipped++;
      continue;
    }
    
    // Extract name (try multiple possible column names)
    const name = record.name || record.Name || record['Full Name'] || record['First Name'];
    
    // Extract created date
    const createdDateStr = record.createdDate || record['Created Date'] || record.Date;
    const waitlistDate = createdDateStr ? new Date(createdDateStr) : new Date();
    
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email)
      });
      
      if (existingUser) {
        console.log(`⏭️  Row ${index + 1}: ${email} - Already exists, skipping`);
        skipped++;
        continue;
      }
      
      // Create username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Import as waitlist user
      await db.insert(users).values({
        email: email.toLowerCase(),
        username: username,
        name: name || null,
        password: null, // No password until they sign up
        waitlist: true,
        waitlistDate: waitlistDate,
        bio: 'Imported from Wix waitlist',
        createdAt: waitlistDate
      });
      
      console.log(`✅ Row ${index + 1}: ${email} - Imported successfully`);
      imported++;
      
    } catch (error: any) {
      console.error(`❌ Row ${index + 1}: ${email} - Error: ${error.message}`);
      errors++;
    }
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped:  ${skipped} (already exist)`);
  console.log(`   ❌ Errors:   ${errors}`);
  console.log(`   📝 Total:    ${records.length}`);
  
  if (imported > 0) {
    console.log('\n🎉 Import complete! Verifying...');
    
    // Verify import
    const waitlistUsers = await db.query.users.findMany({
      where: eq(users.waitlist, true),
      columns: {
        id: true,
        email: true,
        name: true,
        waitlistDate: true
      },
      limit: 10
    });
    
    console.log(`\n📋 Sample of imported users (first 10):`);
    waitlistUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} - ${user.name || 'No name'} - ${user.waitlistDate}`);
    });
  }
}

// Run import
importWixWaitlist()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
