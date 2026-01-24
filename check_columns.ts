
import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position;
    `);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error(err);
    }
}

main();
