/**
 * GDPR DATA EXPORT SERVICE (P0 #5)
 * Full user data export as ZIP file
 */

import { db } from '@shared/db';
import { eq } from 'drizzle-orm';
import { 
  users, 
  posts, 
  postComments,
  events, 
  groups, 
  housingListings,
  housingBookings,
  media,
  dataExportRequests
} from '@shared/schema';

/**
 * Request data export for a user
 */
export async function requestDataExport(userId: number): Promise<number> {
  const [request] = await db.insert(dataExportRequests).values({
    userId,
    status: 'pending'
  }).returning();

  // Start processing asynchronously
  processDataExport(request.id, userId).catch(error => {
    console.error(`Data export failed for user ${userId}:`, error);
    db.update(dataExportRequests)
      .set({ status: 'failed' })
      .where(eq(dataExportRequests.id, request.id));
  });

  return request.id;
}

/**
 * Process data export (async)
 */
async function processDataExport(requestId: number, userId: number): Promise<void> {
  // Update status to processing
  await db.update(dataExportRequests)
    .set({ status: 'processing' })
    .where(eq(dataExportRequests.id, requestId));

  // Gather all user data
  const userData = await gatherUserData(userId);

  // Generate ZIP (in production, upload to cloud storage)
  // For now, store as JSON string
  const zipData = await createZipData(userData);

  // In production: Upload to Cloudinary/S3 and get URL
  // For dev: Store as base64 or JSON
  const downloadUrl = `data:application/json;base64,${Buffer.from(JSON.stringify(zipData)).toString('base64')}`;

  // Update request with download URL
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  await db.update(dataExportRequests)
    .set({ 
      status: 'completed',
      downloadUrl,
      expiresAt,
      completedAt: new Date()
    })
    .where(eq(dataExportRequests.id, requestId));
}

/**
 * Gather all user data from database
 */
async function gatherUserData(userId: number) {
  // Fetch user profile
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  // Fetch user posts
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.userId, userId)
  });

  // Fetch user comments
  const userComments = await db.query.postComments.findMany({
    where: eq(postComments.userId, userId)
  });

  // Fetch user events
  const userEvents = await db.query.events.findMany({
    where: eq(events.organizerId, userId)
  });

  // Fetch group memberships
  const userGroups = await db.query.groupMembers.findMany({
    where: eq(groups.id, userId)
  });

  // Fetch housing listings
  const userHousingListings = await db.query.housingListings.findMany({
    where: eq(housingListings.hostId, userId)
  });

  // Fetch housing bookings
  const userBookings = await db.query.housingBookings.findMany({
    where: eq(housingBookings.guestId, userId)
  });

  // Fetch media uploads
  const userMedia = await db.query.media.findMany({
    where: eq(media.userId, userId)
  });

  return {
    profile: user,
    posts: userPosts,
    comments: userComments,
    events: userEvents,
    groups: userGroups,
    housingListings: userHousingListings,
    bookings: userBookings,
    media: userMedia,
    exportDate: new Date().toISOString(),
    exportVersion: '1.0'
  };
}

/**
 * Create ZIP data structure
 */
async function createZipData(userData: any) {
  return {
    'profile.json': JSON.stringify(userData.profile, null, 2),
    'posts.json': JSON.stringify(userData.posts, null, 2),
    'comments.json': JSON.stringify(userData.comments, null, 2),
    'events.json': JSON.stringify(userData.events, null, 2),
    'groups.json': JSON.stringify(userData.groups, null, 2),
    'housing-listings.json': JSON.stringify(userData.housingListings, null, 2),
    'bookings.json': JSON.stringify(userData.bookings, null, 2),
    'media.json': JSON.stringify(userData.media, null, 2),
    'README.txt': `Mundo Tango Data Export
Exported on: ${userData.exportDate}
Export Version: ${userData.exportVersion}

This ZIP contains all your personal data stored on Mundo Tango.

Files included:
- profile.json: Your account information
- posts.json: All your posts
- comments.json: All your comments
- events.json: Events you've created
- groups.json: Your group memberships
- housing-listings.json: Your housing listings
- bookings.json: Your booking history
- media.json: Your uploaded media files

For questions about this export, contact support@mundotango.life
`
  };
}

/**
 * Get data export status
 */
export async function getDataExportStatus(requestId: number, userId: number) {
  const request = await db.query.dataExportRequests.findFirst({
    where: eq(dataExportRequests.id, requestId)
  });

  if (!request || request.userId !== userId) {
    return null;
  }

  return request;
}

/**
 * Get all data export requests for a user
 */
export async function getUserDataExports(userId: number) {
  return await db.query.dataExportRequests.findMany({
    where: eq(dataExportRequests.userId, userId),
    orderBy: (table: any, { desc }: any) => [desc(table.requestedAt)]
  });
}
