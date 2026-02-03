/**
 * HubSpot Integration Service
 * 
 * Syncs Mundo Tango users to HubSpot CRM as contacts.
 * Uses official @hubspot/api-client library.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("@hubspot/api-client");

// Initialize HubSpot client
const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

// Map DB user fields to HubSpot contact properties
interface UserData {
  id: number;
  email: string;
  name?: string | null;
  username?: string | null;
  city?: string | null;
  country?: string | null;
  waitlist?: boolean | null;
  is_verified?: boolean | null;
  created_at?: Date | string | null;
}

type HubSpotContactProperties = Record<string, string>;

/**
 * Parse full name into first/last name
 */
function parseFullName(fullName?: string | null): { firstname?: string; lastname?: string } {
  if (!fullName) return {};
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstname: parts[0] };
  }
  
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(" "),
  };
}

/**
 * Map user data to HubSpot contact properties
 * Uses only standard HubSpot properties (no custom properties required)
 */
function mapUserToHubSpotContact(user: UserData): HubSpotContactProperties {
  const { firstname, lastname } = parseFullName(user.name);
  
  const props: HubSpotContactProperties = {
    email: user.email,
    hs_lead_status: user.waitlist ? "OPEN" : "CONNECTED", // Valid HubSpot values
  };
  
  if (firstname) props.firstname = firstname;
  if (lastname) props.lastname = lastname;
  if (user.city) props.city = user.city;
  if (user.country) props.country = user.country;
  if (user.username) props.company = `@${user.username}`; // Use company for username
  
  return props;
}

export class HubSpotService {
  private static isConfigured(): boolean {
    return !!process.env.HUBSPOT_ACCESS_TOKEN;
  }

  /**
   * Create or update a contact in HubSpot (upsert by email)
   */
  static async syncContact(user: UserData): Promise<{ success: boolean; contactId?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.warn("[HubSpot] Not configured - skipping sync");
      return { success: false, error: "HubSpot not configured" };
    }

    try {
      const properties = mapUserToHubSpotContact(user);
      
      // Try to find existing contact by email
      let existingContactId: string | null = null;
      
      try {
        const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
          filterGroups: [{
            filters: [{
              propertyName: "email",
              operator: "EQ" as any, // HubSpot API accepts string
              value: user.email,
            }],
          }],
          properties: ["email"],
          limit: 1,
        });
        
        if (searchResponse.results.length > 0) {
          existingContactId = searchResponse.results[0].id;
        }
      } catch {
        // Contact not found, will create new
      }

      if (existingContactId) {
        // Update existing contact
        const response = await hubspotClient.crm.contacts.basicApi.update(
          existingContactId,
          { properties }
        );
        console.log(`[HubSpot] Updated contact ${user.email} (ID: ${response.id})`);
        return { success: true, contactId: response.id };
      } else {
        // Create new contact
        const response = await hubspotClient.crm.contacts.basicApi.create({
          properties,
          associations: [],
        });
        console.log(`[HubSpot] Created contact ${user.email} (ID: ${response.id})`);
        return { success: true, contactId: response.id };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[HubSpot] Error syncing contact ${user.email}:`, message);
      return { success: false, error: message };
    }
  }

  /**
   * Batch sync multiple users to HubSpot
   */
  static async syncAllUsers(users: UserData[]): Promise<{
    total: number;
    success: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  }> {
    if (!this.isConfigured()) {
      return { total: 0, success: 0, failed: 0, errors: [{ email: "N/A", error: "HubSpot not configured" }] };
    }

    const results = {
      total: users.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    console.log(`[HubSpot] Starting batch sync of ${users.length} users...`);

    for (const user of users) {
      const result = await this.syncContact(user);
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ email: user.email, error: result.error || "Unknown error" });
      }

      // Rate limiting - HubSpot allows 100 requests per 10 seconds
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[HubSpot] Batch sync complete: ${results.success} succeeded, ${results.failed} failed`);
    return results;
  }

  /**
   * Get sync status - check if HubSpot is configured and accessible
   */
  static async getStatus(): Promise<{
    configured: boolean;
    connected: boolean;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return { configured: false, connected: false, error: "HUBSPOT_ACCESS_TOKEN not set" };
    }

    try {
      // Test connection by getting account info
      await hubspotClient.crm.contacts.basicApi.getPage(1);
      return { configured: true, connected: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { configured: true, connected: false, error: message };
    }
  }
}
