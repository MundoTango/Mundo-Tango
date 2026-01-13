/**
 * Import Encuentros from CSV
 * Loads 60 encuentros from the attached CSV file into the events table
 * with proper city matching and group linking
 */

import { db } from "@shared/db";
import { events, groups, eventSeries } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

interface EncuentroRow {
  "Event Name": string;
  City: string;
  Country: string;
  "Start Date": string;
  "End Date": string;
  Website: string;
  Facebook: string;
  "Scraper Query": string;
}

function generateSlug(title: string, city: string, date: string): string {
  const base = `${title}-${city}-${date}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
  return base;
}

async function findOrCreateCityGroup(city: string, country: string): Promise<number | null> {
  const normalizedCity = city.split(",")[0].trim();
  
  const existingGroup = await db
    .select({ id: groups.id })
    .from(groups)
    .where(
      and(
        eq(groups.type, "city"),
        ilike(groups.city, normalizedCity)
      )
    )
    .limit(1);

  if (existingGroup.length > 0) {
    return existingGroup[0].id;
  }

  const [newGroup] = await db
    .insert(groups)
    .values({
      name: `${normalizedCity} Tango`,
      slug: normalizedCity.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: `Tango community in ${normalizedCity}, ${country}`,
      type: "city",
      city: normalizedCity,
      country: country,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: groups.id });

  console.log(`[Import] Created city group for ${normalizedCity}, ${country}`);
  return newGroup.id;
}

async function checkExistingEvent(title: string, city: string, startDate: Date): Promise<boolean> {
  const normalizedCity = city.split(",")[0].trim();
  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await db
    .select({ id: events.id })
    .from(events)
    .where(
      and(
        ilike(events.title, `%${title}%`),
        ilike(events.city, normalizedCity),
        sql`${events.startDate} >= ${startOfDay}`,
        sql`${events.startDate} <= ${endOfDay}`
      )
    )
    .limit(1);

  return existing.length > 0;
}

async function importEncuentros() {
  console.log("[Import] Starting encuentros CSV import...");

  const csvPath = path.join(process.cwd(), "attached_assets/encuentros_-_Sheet1_1768295847260.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error("[Import] CSV file not found:", csvPath);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records: EncuentroRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`[Import] Found ${records.length} encuentros in CSV`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of records) {
    try {
      const title = row["Event Name"];
      const city = row.City;
      const country = row.Country;
      const startDateStr = row["Start Date"];
      const endDateStr = row["End Date"];
      const website = row.Website || null;
      const facebook = row.Facebook || null;

      if (!title || !city || !startDateStr) {
        console.log(`[Import] Skipping row with missing data: ${title}`);
        skipped++;
        continue;
      }

      const startDate = new Date(startDateStr);
      const endDate = endDateStr ? new Date(endDateStr) : null;

      const exists = await checkExistingEvent(title, city, startDate);
      if (exists) {
        console.log(`[Import] Event already exists: ${title} in ${city}`);
        skipped++;
        continue;
      }

      const groupId = await findOrCreateCityGroup(city, country);
      const slug = generateSlug(title, city, startDateStr);
      const normalizedCity = city.split(",")[0].trim();

      const ticketUrl = website || facebook || null;

      await db.insert(events).values({
        title,
        slug,
        description: `${title} - Tango encuentro in ${normalizedCity}, ${country}. ${endDate ? `From ${startDateStr} to ${endDateStr}.` : `On ${startDateStr}.`}`,
        eventType: "festival",
        category: "encuentro",
        userId: 1,
        startDate,
        endDate,
        location: `${normalizedCity}, ${country}`,
        city: normalizedCity,
        country,
        groupId,
        visibility: "public",
        status: "approved",
        isFree: false,
        isPaid: true,
        ticketUrl,
        sourceUrl: website || facebook || null,
        sourceName: "Encuentros CSV Import",
        isPlaceholder: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`[Import] ✅ Imported: ${title} (${normalizedCity}, ${country})`);
      imported++;
    } catch (err) {
      console.error(`[Import] ❌ Error importing ${row["Event Name"]}:`, err);
      errors++;
    }
  }

  console.log("\n[Import] ========== SUMMARY ==========");
  console.log(`[Import] Total in CSV: ${records.length}`);
  console.log(`[Import] Imported: ${imported}`);
  console.log(`[Import] Skipped (duplicates/missing data): ${skipped}`);
  console.log(`[Import] Errors: ${errors}`);
  console.log("[Import] ================================\n");
}

importEncuentros()
  .then(() => {
    console.log("[Import] Import complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[Import] Fatal error:", err);
    process.exit(1);
  });
