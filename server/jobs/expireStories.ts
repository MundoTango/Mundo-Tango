import { db } from '../db';
import { posts } from '@shared/schema';
import { and, eq, lt } from 'drizzle-orm';

export async function expireStories() {
  try {
    const now = new Date();
    
    // Delete expired stories
    const result = await db.delete(posts).where(
      and(
        eq(posts.type, 'story'),
        lt(posts.expiresAt, now)
      )
    );
    
    const deletedCount = result.rowCount || 0;
    
    if (deletedCount > 0) {
      console.log(`[Story Expiration] Expired ${deletedCount} stories at ${now.toISOString()}`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error('[Story Expiration] Error expiring stories:', error);
    throw error;
  }
}

// Initialize story expiration job (runs every hour)
export function initStoryExpirationJob() {
  console.log('[Story Expiration] Initializing story expiration job (runs every hour)');
  
  // Run immediately on startup
  expireStories().catch(error => {
    console.error('[Story Expiration] Initial expiration failed:', error);
  });
  
  // Then run every hour
  setInterval(() => {
    expireStories().catch(error => {
      console.error('[Story Expiration] Scheduled expiration failed:', error);
    });
  }, 60 * 60 * 1000); // 1 hour in milliseconds
}
