import { db } from '../../db';
import {
  invitationBatches,
  batchInvitations,
  friendCloseness,
  InsertInvitationBatch,
  InsertBatchInvitation
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface BatchInvitationRequest {
  userId: number;
  batchName?: string;
  platform: 'facebook_messenger' | 'whatsapp' | 'email';
  friends: Array<{
    name: string;
    friendId?: string;
    platform: string;
  }>;
  messageTemplate?: string;
  scheduledFor?: Date;
}

export interface BatchProgress {
  batchId: number;
  status: string;
  totalInvitations: number;
  sentInvitations: number;
  failedInvitations: number;
  percentComplete: number;
}

export class InvitationBatchingService {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * Create a new invitation batch
   * Rate limiting: Max 50 invitations per batch initially
   */
  async createBatch(request: BatchInvitationRequest): Promise<number> {
    // Rate limiting check
    const MAX_INVITATIONS_PER_BATCH = 50;
    if (request.friends.length > MAX_INVITATIONS_PER_BATCH) {
      throw new Error(`Maximum ${MAX_INVITATIONS_PER_BATCH} invitations per batch`);
    }

    // Create batch
    const batchName = request.batchName || `Batch ${new Date().toISOString().split('T')[0]}`;
    const [batch] = await db.insert(invitationBatches).values({
      userId: request.userId,
      batchName,
      platform: request.platform,
      totalInvitations: request.friends.length,
      messageTemplate: request.messageTemplate,
      scheduledFor: request.scheduledFor || new Date(),
      status: 'pending'
    }).returning();

    // Create individual invitations
    const invitations: InsertBatchInvitation[] = request.friends.map(friend => ({
      batchId: batch.id,
      friendName: friend.name,
      friendId: friend.friendId,
      platform: friend.platform,
      messageContent: this.generateMessage(friend.name, request.messageTemplate),
      status: 'pending'
    }));

    await db.insert(batchInvitations).values(invitations);

    console.log(`[InvitationBatchingService] Created batch ${batch.id} with ${invitations.length} invitations`);

    return batch.id;
  }

  /**
   * Generate personalized message for each friend
   */
  private generateMessage(friendName: string, template?: string): string {
    if (template) {
      return template.replace('{name}', friendName);
    }

    return `Hi ${friendName}! 👋\n\nI wanted to invite you to join me on Mundo Tango - a community where tango dancers from around the world connect, discover events, and share their passion for tango.\n\nI think you'd love it! It's a great way to stay connected with the tango community and discover new events.\n\nJoin me here: https://mundotango.life\n\nSee you on the dance floor! 💃🕺`;
  }

  /**
   * Process batch - Send invitations in batches of 10 every 2-3 days
   * This is called by the BullMQ job
   */
  async processBatch(batchId: number): Promise<void> {
    const batch = await db.query.invitationBatches.findFirst({
      where: eq(invitationBatches.id, batchId)
    });

    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    if (batch.status !== 'pending') {
      console.log(`[InvitationBatchingService] Batch ${batchId} already processed (${batch.status})`);
      return;
    }

    // Mark as processing
    await db.update(invitationBatches)
      .set({ status: 'processing', processedAt: new Date() })
      .where(eq(invitationBatches.id, batchId));

    // Get pending invitations
    const pendingInvitations = await db.query.batchInvitations.findMany({
      where: and(
        eq(batchInvitations.batchId, batchId),
        eq(batchInvitations.status, 'pending')
      )
    });

    console.log(`[InvitationBatchingService] Processing ${pendingInvitations.length} invitations from batch ${batchId}`);

    let sentCount = 0;
    let failedCount = 0;

    // Send invitations (in production, this would integrate with FB Messenger API)
    for (const invitation of pendingInvitations) {
      try {
        // In production: await this.sendToMessenger(invitation);
        console.log(`[InvitationBatchingService] Would send to: ${invitation.friendName}`);
        
        await db.update(batchInvitations)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(batchInvitations.id, invitation.id));
        
        sentCount++;
      } catch (error: any) {
        console.error(`[InvitationBatchingService] Failed to send to ${invitation.friendName}:`, error);
        
        await db.update(batchInvitations)
          .set({ status: 'failed', errorMessage: error.message })
          .where(eq(batchInvitations.id, invitation.id));
        
        failedCount++;
      }
    }

    // Update batch status
    await db.update(invitationBatches)
      .set({
        status: 'completed',
        sentInvitations: sentCount,
        failedInvitations: failedCount,
        completedAt: new Date()
      })
      .where(eq(invitationBatches.id, batchId));

    console.log(`[InvitationBatchingService] Batch ${batchId} complete: ${sentCount} sent, ${failedCount} failed`);
  }

  /**
   * Get batch progress
   */
  async getBatchProgress(batchId: number): Promise<BatchProgress | null> {
    const batch = await db.query.invitationBatches.findFirst({
      where: eq(invitationBatches.id, batchId)
    });

    if (!batch) return null;

    const percentComplete = batch.totalInvitations > 0
      ? Math.round((batch.sentInvitations / batch.totalInvitations) * 100)
      : 0;

    return {
      batchId: batch.id,
      status: batch.status,
      totalInvitations: batch.totalInvitations,
      sentInvitations: batch.sentInvitations,
      failedInvitations: batch.failedInvitations,
      percentComplete
    };
  }

  /**
   * Get all batches for user
   */
  async getUserBatches(): Promise<any[]> {
    return db.query.invitationBatches.findMany({
      where: eq(invitationBatches.userId, this.userId),
      orderBy: [desc(invitationBatches.createdAt)]
    });
  }

  /**
   * Get top friends to invite based on closeness score
   */
  async getTopFriendsToInvite(limit = 20): Promise<any[]> {
    return db.query.friendCloseness.findMany({
      where: eq(friendCloseness.userId, this.userId),
      orderBy: [desc(friendCloseness.closenessScore)],
      limit
    });
  }

  /**
   * Check daily rate limit
   * Max 50 invitations per day initially
   */
  async checkDailyRateLimit(): Promise<{ allowed: boolean; remaining: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sentToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(batchInvitations)
      .innerJoin(invitationBatches, eq(batchInvitations.batchId, invitationBatches.id))
      .where(and(
        eq(invitationBatches.userId, this.userId),
        sql`${batchInvitations.sentAt} >= ${today}`
      ));

    const MAX_DAILY_INVITATIONS = 50;
    const count = Number(sentToday[0]?.count || 0);
    const remaining = Math.max(0, MAX_DAILY_INVITATIONS - count);

    return {
      allowed: count < MAX_DAILY_INVITATIONS,
      remaining
    };
  }
}
