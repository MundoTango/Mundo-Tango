import { db } from "../../db";
import { planProgress, users, type InsertPlanProgress, type SelectPlanProgress } from "../../../shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Plan Tracker Service
 * 
 * Tracks Scott's validation progress through all 47 pages of Part 10 roadmap.
 * Parses MB_MD_FINAL_PLAN.md into structured roadmap data.
 */

export interface PageDefinition {
  name: string;
  url: string;
  category: 'core' | 'community' | 'messaging' | 'admin' | 'ai';
  description: string;
}

export interface RoadmapStats {
  total: number;
  validated: number;
  inProgress: number;
  pending: number;
  issuesFound: number;
  percentComplete: number;
}

export interface CategoryProgress {
  category: string;
  total: number;
  validated: number;
  percentComplete: number;
}

// Define all 47 pages from MB_MD_FINAL_PLAN.md Part 10
export const PART_10_PAGES: PageDefinition[] = [
  // CORE FEATURES (9 pages)
  { name: "Dashboard/Home Feed", url: "/", category: "core", description: "Main feed with posts, events, housing" },
  { name: "User Profile Page", url: "/profile/:username", category: "core", description: "Public user profile with bio, photos, stats" },
  { name: "Profile Settings", url: "/settings/profile", category: "core", description: "Edit profile, privacy, preferences" },
  { name: "Privacy & Security", url: "/settings/security", category: "core", description: "2FA, password, privacy controls" },
  { name: "Search & Discover", url: "/search", category: "core", description: "Global search for users, events, housing" },
  { name: "Friendship System", url: "/friends", category: "core", description: "Friends list, requests, suggestions" },
  { name: "Friendship Requests", url: "/friends/requests", category: "core", description: "Incoming and outgoing requests" },
  { name: "Friendship Pages", url: "/friends/:id", category: "core", description: "Individual friend relationship page" },
  { name: "Memory Feed", url: "/memory-feed", category: "core", description: "AI-curated memories and highlights" },
  
  // COMMUNITY FEATURES (11 pages)
  { name: "Post Creator", url: "/create-post", category: "community", description: "Rich post creation with media" },
  { name: "Community Map (Tango Map)", url: "/map", category: "community", description: "Geographic tango community visualization" },
  { name: "City Groups", url: "/groups/city/:city", category: "community", description: "Location-based community groups" },
  { name: "Professional Groups", url: "/groups/professional", category: "community", description: "Teacher, DJ, organizer groups" },
  { name: "Custom Groups", url: "/groups/custom/:id", category: "community", description: "User-created interest groups" },
  { name: "Event Calendar", url: "/events", category: "community", description: "Browse all tango events" },
  { name: "Event Creation", url: "/events/create", category: "community", description: "Create new events" },
  { name: "Event RSVP & Check-in", url: "/events/:id", category: "community", description: "Event details and RSVP" },
  { name: "Housing Marketplace", url: "/housing", category: "community", description: "Browse housing listings" },
  { name: "Housing Listings", url: "/housing/:id", category: "community", description: "Individual housing detail" },
  { name: "Housing Search", url: "/housing/search", category: "community", description: "Advanced housing search" },
  
  // MESSAGING FEATURES (4 pages)
  { name: "All-in-One Messaging", url: "/messages", category: "messaging", description: "Unified messaging hub" },
  { name: "Direct Messages", url: "/messages/dm/:id", category: "messaging", description: "1-on-1 conversations" },
  { name: "Group Chats", url: "/messages/group/:id", category: "messaging", description: "Group conversations" },
  { name: "Message Threads", url: "/messages/thread/:id", category: "messaging", description: "Threaded discussions" },
  
  // PREMIUM & BILLING (4 pages)
  { name: "Subscription Plans", url: "/premium", category: "core", description: "Premium tier options" },
  { name: "Payment Integration", url: "/premium/payment", category: "core", description: "Stripe checkout flow" },
  { name: "Billing History", url: "/settings/billing", category: "core", description: "Invoice history and management" },
  { name: "Invoice Management", url: "/settings/billing/invoices", category: "core", description: "Download and manage invoices" },
  
  // ADMIN & MODERATION (4 pages)
  { name: "Admin Dashboard", url: "/admin", category: "admin", description: "Admin control panel" },
  { name: "User Management", url: "/admin/users", category: "admin", description: "Manage all users" },
  { name: "Content Moderation", url: "/admin/moderation", category: "admin", description: "Review flagged content" },
  { name: "Analytics & Insights", url: "/admin/analytics", category: "admin", description: "Platform metrics and charts" },
  
  // AI & MR BLUE FEATURES (15 pages)
  { name: "ESA Mind Dashboard", url: "/esa/dashboard", category: "ai", description: "ESA Mind AI control center" },
  { name: "Visual Editor", url: "/visual-editor", category: "ai", description: "Replit-style code editor" },
  { name: "Project Tracker", url: "/esa/projects", category: "ai", description: "Track AI project progress" },
  { name: "Compliance Center", url: "/esa/compliance", category: "ai", description: "GDPR, legal compliance" },
  { name: "Mr. Blue Chat Interface", url: "/mr-blue-studio", category: "ai", description: "Main Mr Blue chat UI" },
  { name: "Mr. Blue 3D Avatar", url: "/mr-blue-studio?tab=avatar", category: "ai", description: "Pixar 3D avatar system" },
  { name: "Mr. Blue Video Avatar", url: "/mr-blue-studio?tab=video", category: "ai", description: "AI video call system" },
  { name: "Mr. Blue Tours System", url: "/mr-blue-studio?tab=tours", category: "ai", description: "Interactive platform tours" },
  { name: "Mr. Blue Suggestions", url: "/mr-blue-studio?tab=suggestions", category: "ai", description: "AI-powered recommendations" },
  { name: "AI Help Button", url: "/*?help=true", category: "ai", description: "Context-aware help system" },
  { name: "Language Switcher", url: "/settings/language", category: "ai", description: "17-language support" },
  { name: "Translation Management", url: "/admin/translations", category: "ai", description: "Manage i18n content" },
  { name: "Badge System", url: "/gamification/badges", category: "ai", description: "Achievement badges" },
  { name: "Invitation Progress Tracker", url: "/invitations", category: "ai", description: "Track friend invitations" },
  { name: "Closeness Metrics Dashboard", url: "/friends/closeness", category: "ai", description: "Friendship analytics" },
];

export class PlanTrackerService {
  /**
   * Initialize plan progress for a user (creates 47 entries)
   */
  async initializeUserProgress(userId: number): Promise<void> {
    const existingProgress = await db
      .select()
      .from(planProgress)
      .where(eq(planProgress.userId, userId));

    if (existingProgress.length > 0) {
      console.log(`[PlanTracker] User ${userId} already has ${existingProgress.length} progress entries`);
      return;
    }

    const entries: InsertPlanProgress[] = PART_10_PAGES.map(page => ({
      userId,
      pageName: page.name,
      pageUrl: page.url,
      category: page.category,
      validated: false,
      status: "pending",
      notes: null,
      issuesFound: 0,
      validatedAt: null,
    }));

    await db.insert(planProgress).values(entries);
    console.log(`[PlanTracker] Initialized ${entries.length} pages for user ${userId}`);
  }

  /**
   * Get all progress for a user
   */
  async getUserProgress(userId: number): Promise<SelectPlanProgress[]> {
    return await db
      .select()
      .from(planProgress)
      .where(eq(planProgress.userId, userId));
  }

  /**
   * Get roadmap with progress data
   */
  async getRoadmap(userId: number): Promise<{
    pages: (PageDefinition & { progress: SelectPlanProgress | null })[];
    stats: RoadmapStats;
    byCategory: CategoryProgress[];
  }> {
    // Get user's progress
    const progress = await this.getUserProgress(userId);

    // Map pages to include progress
    const pages = PART_10_PAGES.map(page => {
      const pageProgress = progress.find(p => p.pageName === page.name);
      return {
        ...page,
        progress: pageProgress || null,
      };
    });

    // Calculate stats
    const stats = this.calculateStats(progress);

    // Calculate by category
    const byCategory = this.calculateCategoryProgress(progress);

    return { pages, stats, byCategory };
  }

  /**
   * Mark page as validated
   */
  async validatePage(
    userId: number,
    pageName: string,
    notes?: string,
    issuesFound?: number
  ): Promise<SelectPlanProgress> {
    const [updated] = await db
      .update(planProgress)
      .set({
        validated: true,
        validatedAt: new Date(),
        status: issuesFound && issuesFound > 0 ? "issues_found" : "completed",
        notes: notes || null,
        issuesFound: issuesFound || 0,
        updatedAt: new Date(),
      })
      .where(and(
        eq(planProgress.userId, userId),
        eq(planProgress.pageName, pageName)
      ))
      .returning();

    return updated;
  }

  /**
   * Update page status (in_progress, pending, etc)
   */
  async updatePageStatus(
    userId: number,
    pageName: string,
    status: string,
    notes?: string
  ): Promise<SelectPlanProgress> {
    const [updated] = await db
      .update(planProgress)
      .set({
        status,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(and(
        eq(planProgress.userId, userId),
        eq(planProgress.pageName, pageName)
      ))
      .returning();

    return updated;
  }

  /**
   * Update progress by page ID
   */
  async updateProgressById(
    pageId: number,
    data: Partial<InsertPlanProgress>
  ): Promise<SelectPlanProgress> {
    const [updated] = await db
      .update(planProgress)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(planProgress.id, pageId))
      .returning();

    return updated;
  }

  /**
   * Calculate overall stats
   */
  private calculateStats(progress: SelectPlanProgress[]): RoadmapStats {
    const total = PART_10_PAGES.length;
    const validated = progress.filter(p => p.validated).length;
    const inProgress = progress.filter(p => p.status === "in_progress").length;
    const pending = progress.filter(p => p.status === "pending").length;
    const issuesFound = progress.reduce((sum, p) => sum + (p.issuesFound || 0), 0);
    const percentComplete = total > 0 ? Math.round((validated / total) * 100) : 0;

    return {
      total,
      validated,
      inProgress,
      pending,
      issuesFound,
      percentComplete,
    };
  }

  /**
   * Calculate progress by category
   */
  private calculateCategoryProgress(progress: SelectPlanProgress[]): CategoryProgress[] {
    const categories = ['core', 'community', 'messaging', 'admin', 'ai'];
    
    return categories.map(category => {
      const categoryPages = PART_10_PAGES.filter(p => p.category === category);
      const total = categoryPages.length;
      const validated = progress.filter(
        p => p.validated && categoryPages.some(cp => cp.name === p.pageName)
      ).length;
      const percentComplete = total > 0 ? Math.round((validated / total) * 100) : 0;

      return {
        category,
        total,
        validated,
        percentComplete,
      };
    });
  }

  /**
   * Get stats only
   */
  async getStats(userId: number): Promise<RoadmapStats> {
    const progress = await this.getUserProgress(userId);
    return this.calculateStats(progress);
  }
}

export const planTrackerService = new PlanTrackerService();
