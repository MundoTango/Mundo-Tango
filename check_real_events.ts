
import { db } from './server/db/index.js';
import { events } from './shared/schema.js';
import { ilike, and, gte, lte } from 'drizzle-orm';

async function main() {
    try {
        const start = new Date('2026-01-12');
        const end = new Date('2026-02-12');
        const results = await db.select().from(events).where(and(ilike(events.city, '%Buenos Aires%'), gte(events.startDate, start), lte(events.startDate, end))).limit(10);
        console.log(JSON.stringify(results.map(r => ({ id: r.id, title: r.title, city: r.city, startDate: r.startDate, status: r.status })), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
main();
