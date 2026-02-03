/**
 * Quick test script to sync all real users to HubSpot
 * Uses ONLY standard HubSpot contact properties (no custom properties needed)
 * Run with: npx tsx server/scripts/test-hubspot-sync.ts
 */

import 'dotenv/config';
import { Client } from "@hubspot/api-client";

const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

// Import database
import { db } from "../db";
import { users } from "@shared/schema";
import { not, like } from "drizzle-orm";

async function testHubSpotSync() {
  console.log("🔌 Testing HubSpot connection...");
  
  // Test connection
  try {
    await hubspotClient.crm.contacts.basicApi.getPage(1);
    console.log("✅ HubSpot connection successful!\n");
  } catch (error) {
    console.error("❌ HubSpot connection failed:", error);
    process.exit(1);
  }

  // Get real users
  console.log("📊 Fetching real users from database...");
  const realUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      city: users.city,
      country: users.country,
      waitlist: users.waitlist,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(
      not(like(users.email, "%@discovered.mundotango.app"))
    );

  console.log(`Found ${realUsers.length} real users to sync\n`);

  // Sync each user
  let success = 0;
  let failed = 0;

  for (const user of realUsers) {
    try {
      const { firstname, lastname } = parseFullName(user.name);
      
      // Use ONLY standard HubSpot properties
      const properties: Record<string, string> = {
        email: user.email,
        hs_lead_status: user.waitlist ? "OPEN" : "CONNECTED",
      };
      
      if (firstname) properties.firstname = firstname;
      if (lastname) properties.lastname = lastname;
      if (user.city) properties.city = user.city;       // Standard property
      if (user.country) properties.country = user.country; // Standard property
      if (user.username) properties.company = `@${user.username}`; // Use company for username

      // Try to find existing contact
      let existingContactId: string | null = null;
      try {
        const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
          filterGroups: [{
            filters: [{
              propertyName: "email",
              operator: "EQ" as any,
              value: user.email,
            }],
          }],
          properties: ["email"],
          limit: 1,
        });
        
        if (searchResponse.results.length > 0) {
          existingContactId = searchResponse.results[0].id;
        }
      } catch {}

      if (existingContactId) {
        await hubspotClient.crm.contacts.basicApi.update(existingContactId, { properties });
        console.log(`✏️  Updated: ${user.email}`);
      } else {
        await hubspotClient.crm.contacts.basicApi.create({ properties, associations: [] });
        console.log(`➕ Created: ${user.email}`);
      }
      
      success++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 120));
    } catch (error: any) {
      const msg = error.body ? JSON.stringify(error.body).slice(0, 150) : error.message;
      console.error(`❌ Failed: ${user.email} - ${msg}`);
      failed++;
    }
  }

  console.log(`\n✅ Sync complete: ${success} succeeded, ${failed} failed`);
  process.exit(0);
}

function parseFullName(fullName?: string | null): { firstname?: string; lastname?: string } {
  if (!fullName) return {};
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0] };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

testHubSpotSync().catch(console.error);
