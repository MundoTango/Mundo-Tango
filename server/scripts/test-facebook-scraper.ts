/**
 * Test script for Facebook Scraper Service
 * Run with: npx tsx server/scripts/test-facebook-scraper.ts
 */

import { facebookScraper } from '../services/FacebookScraperService';

async function main() {
  console.log('🚀 Testing Facebook Scraper Service\n');

  try {
    // Test account configuration
    const account = process.argv[2] || 'sboddye'; // Can pass account name as argument
    
    console.log(`Testing with account: ${account}\n`);

    const username = process.env[`facebook_${account}_username`];
    const password = process.env[`facebook_${account}_password`];

    if (!username || !password) {
      throw new Error(`Missing credentials for ${account}. Please check your Replit Secrets.`);
    }

    console.log('✅ Credentials found in environment\n');

    // Run scraper
    const result = await facebookScraper.scrapeAccount({
      username,
      password,
      accountName: account,
      headless: false // Set to false for 2FA support
    });

    // Display results
    console.log('\n📊 SCRAPING RESULTS:\n');
    console.log('='.repeat(60));
    
    if (result.success) {
      console.log('✅ Status: SUCCESS\n');
      
      if (result.profile) {
        console.log(`📝 Profile: ${result.profile.name}`);
        console.log(`   Location: ${result.profile.location || 'N/A'}`);
        console.log(`   Bio: ${result.profile.bio?.substring(0, 100) || 'N/A'}...\n`);
      }

      console.log(`📄 Posts: ${result.posts?.length || 0} extracted`);
      console.log(`👥 Friends: ${result.friends?.length || 0} extracted`);
      console.log(`📅 Events: ${result.events?.length || 0} extracted`);
      console.log(`👫 Groups: ${result.groups?.length || 0} extracted\n`);

      console.log('📁 Files saved to:');
      console.log(`   attached_assets/facebook_import/${account}/\n`);

    } else {
      console.log('❌ Status: FAILED\n');
      console.log('Errors:');
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run test
main()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  });
