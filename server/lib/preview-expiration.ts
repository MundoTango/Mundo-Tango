import { storage } from "../storage";

export async function expireOldPreviews(): Promise<void> {
  try {
    const expiredPreviews = await storage.getExpiredPreviews();
    
    for (const preview of expiredPreviews) {
      await storage.expirePreviewDeployment(preview.id);
      console.log(`[Preview Expiration] Expired preview ${preview.id} (${preview.name})`);
    }
    
    if (expiredPreviews.length > 0) {
      console.log(`[Preview Expiration] Expired ${expiredPreviews.length} preview(s)`);
    }
  } catch (error) {
    console.error("[Preview Expiration] Error expiring previews:", error);
  }
}

export function startPreviewExpirationChecker(): NodeJS.Timeout {
  const INTERVAL = 60 * 60 * 1000;
  
  expireOldPreviews();
  
  const interval = setInterval(async () => {
    await expireOldPreviews();
  }, INTERVAL);
  
  console.log("[Preview Expiration] Started preview expiration checker (runs every hour)");
  
  return interval;
}