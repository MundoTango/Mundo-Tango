import { db } from '@shared/db';
import { supportTickets } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import type { 
  InsertSupportTicket, 
  SelectSupportTicket 
} from "@shared/schema";

/**
 * AI Support Service
 * 
 * Provides AI-powered customer support with human escalation.
 * Part 2 P0 Workflow - CRITICAL for user experience and support efficiency.
 * 
 * Features:
 * - AI-first response generation
 * - Confidence scoring
 * - Automatic human escalation for low-confidence responses
 * - Conversation history tracking
 * - Satisfaction ratings
 * - Related ticket detection
 * 
 * Priority Levels:
 * - low: Non-urgent, can wait 24-48 hours
 * - medium: Standard priority, respond within 12-24 hours
 * - high: Urgent, respond within 4-6 hours
 * - critical: Emergency, immediate response required
 */
export class AISupportService {
  /**
   * Create a new support ticket with AI response
   */
  static async createTicket(
    data: InsertSupportTicket & {
      aiResponse?: string;
      aiConfidence?: number;
      conversationHistory?: any[];
    }
  ): Promise<SelectSupportTicket> {
    const [ticket] = await db
      .insert(supportTickets)
      .values(data)
      .returning();

    return ticket;
  }

  /**
   * Get all open tickets
   */
  static async getOpenTickets(
    priority?: string,
    humanReviewRequired?: boolean
  ): Promise<SelectSupportTicket[]> {
    let query = db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.status, 'open'));

    if (priority) {
      query = query.where(eq(supportTickets.priority, priority)) as any;
    }

    if (humanReviewRequired !== undefined) {
      query = query.where(
        eq(supportTickets.humanReviewRequired, humanReviewRequired)
      ) as any;
    }

    return query.orderBy(desc(supportTickets.createdAt));
  }

  /**
   * Get tickets requiring human review
   */
  static async getTicketsRequiringReview(): Promise<SelectSupportTicket[]> {
    return db
      .select()
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.humanReviewRequired, true),
          eq(supportTickets.status, 'awaiting_review')
        )
      )
      .orderBy(desc(supportTickets.priority), desc(supportTickets.createdAt));
  }

  /**
   * Get high-priority tickets
   */
  static async getHighPriorityTickets(): Promise<SelectSupportTicket[]> {
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.status, 'open'))
      .orderBy(desc(supportTickets.priority), desc(supportTickets.createdAt));
  }

  /**
   * Get ticket by ID
   */
  static async getTicket(id: number): Promise<SelectSupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id))
      .limit(1);

    return ticket;
  }

  /**
   * Get tickets for a specific user
   */
  static async getUserTickets(userId: number): Promise<SelectSupportTicket[]> {
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  /**
   * Add AI response to ticket
   */
  static async addAIResponse(
    id: number,
    response: string,
    confidence: number
  ): Promise<SelectSupportTicket> {
    const ticket = await this.getTicket(id);
    if (!ticket) throw new Error('Ticket not found');

    const newMessage = {
      role: 'ai' as const,
      message: response,
      timestamp: new Date().toISOString(),
      confidence,
    };

    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        aiResponse: response,
        aiConfidence: confidence,
        humanReviewRequired: confidence < 0.7,
        conversationHistory: [
          ...(ticket.conversationHistory || []),
          newMessage,
        ],
        updatedAt: new Date(),
        firstResponseAt: ticket.firstResponseAt || new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();

    return updatedTicket;
  }

  /**
   * Assign ticket to human agent
   */
  static async assignToAgent(
    id: number,
    agentId: number
  ): Promise<SelectSupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set({
        assignedTo: agentId,
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();

    return ticket;
  }

  /**
   * Add human agent response
   */
  static async addAgentResponse(
    id: number,
    agentId: number,
    message: string
  ): Promise<SelectSupportTicket> {
    const ticket = await this.getTicket(id);
    if (!ticket) throw new Error('Ticket not found');

    const newMessage = {
      role: 'agent' as const,
      message,
      timestamp: new Date().toISOString(),
    };

    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        conversationHistory: [
          ...(ticket.conversationHistory || []),
          newMessage,
        ],
        updatedAt: new Date(),
        firstResponseAt: ticket.firstResponseAt || new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();

    return updatedTicket;
  }

  /**
   * Resolve ticket
   */
  static async resolveTicket(
    id: number,
    resolvedBy: number,
    resolution: string
  ): Promise<SelectSupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set({
        status: 'resolved',
        resolvedBy,
        resolution,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();

    return ticket;
  }

  /**
   * Add satisfaction rating
   */
  static async addSatisfactionRating(
    id: number,
    rating: number,
    feedback?: string
  ): Promise<SelectSupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set({
        satisfactionRating: rating,
        satisfactionFeedback: feedback,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();

    return ticket;
  }

  /**
   * Escalate ticket to higher priority
   */
  static async escalateTicket(
    id: number,
    newPriority: 'high' | 'critical',
    reason: string
  ): Promise<SelectSupportTicket> {
    const ticket = await this.getTicket(id);
    if (!ticket) throw new Error('Ticket not found');

    const escalationNote = {
      role: 'agent' as const,
      message: `Ticket escalated to ${newPriority} priority. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
    };

    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        priority: newPriority,
        humanReviewRequired: true,
        conversationHistory: [
          ...(ticket.conversationHistory || []),
          escalationNote,
        ],
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();

    return updatedTicket;
  }

  /**
   * Get support statistics
   */
  static async getSupportStats(): Promise<{
    open: number;
    inProgress: number;
    resolved: number;
    awaitingReview: number;
    byPriority: { low: number; medium: number; high: number; critical: number };
    avgSatisfactionRating: number | null;
    aiResolutionRate: number;
    total: number;
  }> {
    const tickets = await db.select().from(supportTickets);

    const resolvedWithAI = tickets.filter(
      (t: SelectSupportTicket) => t.status === 'resolved' && !t.assignedTo
    ).length;
    const totalResolved = tickets.filter((t: SelectSupportTicket) => t.status === 'resolved').length;

    const ratingsSum = tickets.reduce(
      (sum: number, t: SelectSupportTicket) => sum + (t.satisfactionRating || 0),
      0
    );
    const ratingsCount = tickets.filter((t: SelectSupportTicket) => t.satisfactionRating).length;

    return {
      open: tickets.filter((t: SelectSupportTicket) => t.status === 'open').length,
      inProgress: tickets.filter((t: SelectSupportTicket) => t.status === 'in_progress').length,
      resolved: totalResolved,
      awaitingReview: tickets.filter((t: SelectSupportTicket) => t.status === 'awaiting_review').length,
      byPriority: {
        low: tickets.filter((t: SelectSupportTicket) => t.priority === 'low').length,
        medium: tickets.filter((t: SelectSupportTicket) => t.priority === 'medium').length,
        high: tickets.filter((t: SelectSupportTicket) => t.priority === 'high').length,
        critical: tickets.filter((t: SelectSupportTicket) => t.priority === 'critical').length,
      },
      avgSatisfactionRating: ratingsCount > 0 ? ratingsSum / ratingsCount : null,
      aiResolutionRate: totalResolved > 0 ? resolvedWithAI / totalResolved : 0,
      total: tickets.length,
    };
  }
}
