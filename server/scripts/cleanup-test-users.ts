/**
 * Script to remove test users from both HubSpot and database
 * Keeps: scott@boddye.com and scott+4@boddye.com
 * Run with: npx tsx server/scripts/cleanup-test-users.ts
 */

import 'dotenv/config';
import { Client } from "@hubspot/api-client";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

// Users to DELETE (from the screenshot)
const usersToDelete = [
  "scott+6@boddye.com",
  "scott+7@boddye.com",
  "scott+3@boddye.com",
  "scott+2@boddye.com",
  "scott+5@boddye.com",
  "sboddye+1@gmail.com",
];

// Users to KEEP (will NOT be deleted)
const usersToKeep = [
  "scott@boddye.com",
  "scott+4@boddye.com",
];

async function deleteFromHubSpot(email: string): Promise<boolean> {
  try {
    // Search for contact by email
    const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: "email",
          operator: "EQ" as any,
          value: email,
        }],
      }],
      properties: ["email"],
      limit: 1,
    });

    if (searchResponse.results.length > 0) {
      const contactId = searchResponse.results[0].id;
      await hubspotClient.crm.contacts.basicApi.archive(contactId);
      console.log(`  ✅ HubSpot: Deleted ${email} (ID: ${contactId})`);
      return true;
    } else {
      console.log(`  ⏭️  HubSpot: Not found ${email}`);
      return false;
    }
  } catch (error: any) {
    console.error(`  ❌ HubSpot error: ${error.message}`);
    return false;
  }
}

async function deleteFromDatabase(email: string): Promise<boolean> {
  try {
    const result = await db.delete(users).where(eq(users.email, email)).returning({ id: users.id });
    if (result.length > 0) {
      console.log(`  ✅ Database: Deleted ${email} (ID: ${result[0].id})`);
      return true;
    } else {
      console.log(`  ⏭️  Database: Not found ${email}`);
      return false;
    }
  } catch (error: any) {
    console.error(`  ❌ Database error: ${error.message}`);
    return false;
  }
}

async function cleanup() {
  console.log("🧹 Cleaning up test users...\n");
  console.log("Users to DELETE:", usersToDelete);
  console.log("Users to KEEP:", usersToKeep);
  console.log("");

  let hubspotDeleted = 0;
  let dbDeleted = 0;

  for (const email of usersToDelete) {
    console.log(`\n📧 Processing: ${email}`);
    
    // Delete from HubSpot first
    if (await deleteFromHubSpot(email)) {
      hubspotDeleted++;
    }
    
    // Delete from database
    if (await deleteFromDatabase(email)) {
      dbDeleted++;
    }

    // Rate limiting for HubSpot
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   HubSpot: ${hubspotDeleted} deleted`);
  console.log(`   Database: ${dbDeleted} deleted`);
  
  process.exit(0);
}

cleanup().catch(console.error);
