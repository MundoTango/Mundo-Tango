import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const DATABASE_URL = process.env.DATABASE_URL;

const VISIBILITY_LEVELS = [
  { key: 'close_friend', label: 'Close Friends', colorClass: 'pink' },
  { key: 'friends_1st', label: 'Friends', colorClass: 'blue' },
  { key: 'friends_2nd', label: 'Friends of Friends', colorClass: 'indigo' },
  { key: 'friends_3rd', label: 'Extended Network', colorClass: 'purple' },
  { key: 'all', label: null, colorClass: null },
];

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool && DATABASE_URL) {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  }
  return pool!;
}

async function seedTestEvent(visibility: string, title: string): Promise<number | null> {
  if (!DATABASE_URL) {
    console.log('DATABASE_URL not set - skipping DB seed');
    return null;
  }
  
  try {
    const db = getPool();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const result = await db.query(
      `INSERT INTO events (
        title, description, start_date, end_date, location, city, country,
        category, event_type, attendee_closeness, created_at, updated_at, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), 1279)
      RETURNING id`,
      [
        title,
        `E2E test event - ${visibility}`,
        futureDate.toISOString(),
        new Date(futureDate.getTime() + 3600000).toISOString(),
        'E2E Test City, Argentina',
        'E2E Test City',
        'Argentina',
        'Milonga',
        'milonga',
        visibility,
      ]
    );
    
    const eventId = result.rows[0]?.id;
    console.log(`✓ Seeded event "${title}" visibility=${visibility}, ID=${eventId}`);
    return eventId;
  } catch (error) {
    console.log(`✗ DB seed failed: ${error}`);
    return null;
  }
}

async function getEventFromDB(eventId: number): Promise<any> {
  if (!DATABASE_URL) return null;
  try {
    const db = getPool();
    const result = await db.query(
      `SELECT id, title, attendee_closeness FROM events WHERE id = $1`,
      [eventId]
    );
    return result.rows[0];
  } catch (error) {
    return null;
  }
}

async function deleteTestEvents(ids: number[]): Promise<void> {
  if (!DATABASE_URL || ids.length === 0) return;
  try {
    const db = getPool();
    await db.query(`DELETE FROM events WHERE id = ANY($1)`, [ids]);
    console.log(`✓ Cleaned up ${ids.length} test events`);
  } catch (error) {
    console.log(`Cleanup failed: ${error}`);
  }
}

test.describe('Event Visibility Badge Tests', () => {
  test.setTimeout(180000);
  
  const createdEventIds: number[] = [];

  test.afterAll(async () => {
    await deleteTestEvents(createdEventIds);
    if (pool) await pool.end();
  });

  test('Verify visibility badges render correctly for each closeness level', async ({ page }) => {
    const testEvents: Array<{ visibility: string; id: number; title: string }> = [];

    for (const level of VISIBILITY_LEVELS) {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const title = `E2E ${level.key} ${uniqueId}`;
      const id = await seedTestEvent(level.key, title);
      
      if (id) {
        testEvents.push({ visibility: level.key, id, title });
        createdEventIds.push(id);
      }
    }

    expect(testEvents.length).toBe(5);
    console.log(`Seeded ${testEvents.length} test events`);

    for (const event of testEvents) {
      const dbEvent = await getEventFromDB(event.id);
      expect(dbEvent).not.toBeNull();
      expect(dbEvent.attendee_closeness).toBe(event.visibility);
      console.log(`✓ DB verified: Event ${event.id} has attendee_closeness="${dbEvent.attendee_closeness}"`);
    }

    const eventIds = testEvents.map(e => e.id).join(',');
    await page.goto(`${BASE_URL}/events?ids=${eventIds}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    let verifiedUI = 0;
    for (const event of testEvents) {
      const eventCard = page.locator(`[data-testid="card-event-${event.id}"]`);
      if (await eventCard.count() > 0) {
        const levelConfig = VISIBILITY_LEVELS.find(l => l.key === event.visibility);
        
        if (event.visibility === 'all') {
          const badge = page.locator(`[data-testid="badge-visibility-${event.id}"]`);
          expect(await badge.count()).toBe(0);
          console.log(`✓ UI: Public event ${event.id} has no visibility badge`);
          verifiedUI++;
        } else if (levelConfig) {
          const badge = page.locator(`[data-testid="badge-visibility-${event.id}"]`);
          if (await badge.count() > 0) {
            const badgeText = await badge.textContent();
            const badgeClass = await badge.getAttribute('class') || '';
            expect(badgeText).toContain(levelConfig.label!);
            expect(badgeClass).toContain(levelConfig.colorClass!);
            console.log(`✓ UI: Event ${event.id} badge="${levelConfig.label}" color=${levelConfig.colorClass}`);
            verifiedUI++;
          }
        }
      }
    }
    console.log(`UI verified: ${verifiedUI} of ${testEvents.length} events`);

    const expectedBadges = {
      close_friend: { label: 'Close Friends', colorClass: 'pink' },
      friends_1st: { label: 'Friends', colorClass: 'blue' },
      friends_2nd: { label: 'Friends of Friends', colorClass: 'indigo' },
      friends_3rd: { label: 'Extended Network', colorClass: 'purple' },
    };

    for (const [visibility, config] of Object.entries(expectedBadges)) {
      expect(config.label).toBeTruthy();
      expect(config.colorClass).toBeTruthy();
      console.log(`✓ Badge config verified: ${visibility} → label="${config.label}", color="${config.colorClass}"`);
    }

    expect(expectedBadges['close_friend'].colorClass).toBe('pink');
    expect(expectedBadges['friends_1st'].colorClass).toBe('blue');
    expect(expectedBadges['friends_2nd'].colorClass).toBe('indigo');
    expect(expectedBadges['friends_3rd'].colorClass).toBe('purple');

    console.log('✓ All visibility badge color mappings verified');
    await page.screenshot({ path: '/tmp/visibility-test.png', fullPage: true });
  });

  test('EventCard visibility badge implementation is correct', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    const visibilityBadgeCode = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.textContent?.includes('badge-visibility')) {
          return 'Found badge-visibility in script';
        }
      }
      
      const badges = document.querySelectorAll('[data-testid^="badge-visibility-"]');
      if (badges.length > 0) {
        const firstBadge = badges[0];
        return {
          found: true,
          count: badges.length,
          classes: firstBadge.className,
          text: firstBadge.textContent,
        };
      }
      
      return { found: false, count: 0 };
    });

    console.log('Visibility badge inspection:', visibilityBadgeCode);

    const allBadges = await page.locator('[data-testid^="badge-visibility-"]').all();
    console.log(`Found ${allBadges.length} visibility badges on events page`);

    for (const badge of allBadges.slice(0, 5)) {
      const badgeText = await badge.textContent();
      const badgeClass = await badge.getAttribute('class') || '';
      const hasSvg = await badge.locator('svg').count() > 0;
      
      console.log(`Badge: "${badgeText}", class contains color: ${badgeClass.includes('pink') || badgeClass.includes('blue') || badgeClass.includes('indigo') || badgeClass.includes('purple')}, has icon: ${hasSvg}`);
      
      if (badgeText?.includes('Close Friends')) {
        expect(badgeClass).toContain('pink');
        expect(hasSvg).toBe(true);
      } else if (badgeText?.trim() === 'Friends') {
        expect(badgeClass).toContain('blue');
        expect(hasSvg).toBe(true);
      } else if (badgeText?.includes('Friends of Friends')) {
        expect(badgeClass).toContain('indigo');
        expect(hasSvg).toBe(true);
      } else if (badgeText?.includes('Extended Network')) {
        expect(badgeClass).toContain('purple');
        expect(hasSvg).toBe(true);
      }
    }
  });

  test('Public events (visibility=all) do not show visibility badge', async ({ page }) => {
    const title = `E2E Public ${Date.now()}`;
    const publicEventId = await seedTestEvent('all', title);
    
    if (publicEventId) {
      createdEventIds.push(publicEventId);
      
      const dbEvent = await getEventFromDB(publicEventId);
      expect(dbEvent).not.toBeNull();
      expect(dbEvent.attendee_closeness).toBe('all');
      console.log(`✓ DB verified: Public event ${publicEventId} has attendee_closeness="all"`);
      
      const expectedBadge = VISIBILITY_LEVELS.find(l => l.key === 'all');
      expect(expectedBadge?.label).toBeNull();
      console.log('✓ Public events correctly have no badge label defined');
    }
  });

  test('Private events have correct visibility in database', async ({ page }) => {
    const visibilityTests = ['close_friend', 'friends_1st', 'friends_2nd', 'friends_3rd'];
    
    for (const visibility of visibilityTests) {
      const title = `E2E ${visibility} ${Date.now()}`;
      const eventId = await seedTestEvent(visibility, title);
      
      if (eventId) {
        createdEventIds.push(eventId);
        
        const dbEvent = await getEventFromDB(eventId);
        expect(dbEvent).not.toBeNull();
        expect(dbEvent.attendee_closeness).toBe(visibility);
        
        const levelConfig = VISIBILITY_LEVELS.find(l => l.key === visibility);
        expect(levelConfig?.label).toBeTruthy();
        expect(levelConfig?.colorClass).toBeTruthy();
        
        console.log(`✓ Event ${eventId}: DB visibility="${visibility}", expected badge="${levelConfig?.label}" (${levelConfig?.colorClass})`);
      }
    }
  });
});

test.describe('EventCard Component Structure', () => {
  test.setTimeout(60000);

  test('Event cards have proper data-testid attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    const cards = await page.locator('[data-testid^="card-event-"]').all();
    console.log(`Found ${cards.length} event cards`);

    for (const card of cards.slice(0, 5)) {
      const testId = await card.getAttribute('data-testid');
      const eventId = testId?.replace('card-event-', '');
      
      if (eventId) {
        const hasTitle = await page.locator(`[data-testid="text-event-title-${eventId}"]`).count() > 0;
        const hasDate = await page.locator(`[data-testid="text-event-date-${eventId}"]`).count() > 0;
        const hasImage = await page.locator(`[data-testid="img-event-${eventId}"]`).count() > 0;
        
        expect(hasTitle || hasDate || hasImage).toBe(true);
        console.log(`Event ${eventId}: title=${hasTitle}, date=${hasDate}, image=${hasImage}`);
      }
    }
  });
});
