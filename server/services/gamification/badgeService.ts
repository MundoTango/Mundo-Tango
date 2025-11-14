import { db } from "../../db";
import { gamificationBadges, userBadges, volunteerStats, uiTestResults } from "@shared/schema";
import { eq, and, count, sql } from "drizzle-orm";

export interface Badge {
  id: number;
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  criteria: any;
  awardedAt?: Date | null;
}

export interface BadgeProgress {
  current: number;
  required: number;
  percentage: number;
}

export const BADGE_DEFINITIONS = [
  {
    badgeId: "first_steps",
    name: "First Steps",
    description: "Complete your first Mr. Blue chat",
    iconUrl: "👣",
    criteria: { type: "mr_blue_chats", count: 1 },
  },
  {
    badgeId: "test_pilot",
    name: "Test Pilot",
    description: "Complete 5 volunteer tests",
    iconUrl: "✈️",
    criteria: { type: "volunteer_tests", count: 5 },
  },
  {
    badgeId: "bug_hunter",
    name: "Bug Hunter",
    description: "Find 10 bugs",
    iconUrl: "🐛",
    criteria: { type: "bugs_found", count: 10 },
  },
  {
    badgeId: "eagle_eye",
    name: "Eagle Eye",
    description: "Find a critical severity bug",
    iconUrl: "🦅",
    criteria: { type: "critical_bug", count: 1 },
  },
  {
    badgeId: "marathon_tester",
    name: "Marathon Tester",
    description: "Complete 50 volunteer tests",
    iconUrl: "🏃",
    criteria: { type: "volunteer_tests", count: 50 },
  },
  {
    badgeId: "code_reviewer",
    name: "Code Reviewer",
    description: "Submit 25 code feedbacks",
    iconUrl: "👨‍💻",
    criteria: { type: "code_feedbacks", count: 25 },
  },
  {
    badgeId: "tour_guide",
    name: "Tour Guide",
    description: "Complete all onboarding tours",
    iconUrl: "🗺️",
    criteria: { type: "onboarding_tours", count: 5 },
  },
  {
    badgeId: "editor_pro",
    name: "Editor Pro",
    description: "Make 100 visual editor edits",
    iconUrl: "✏️",
    criteria: { type: "visual_editor_edits", count: 100 },
  },
  {
    badgeId: "voice_master",
    name: "Voice Master",
    description: "Complete 10 voice chat sessions",
    iconUrl: "🎤",
    criteria: { type: "voice_chats", count: 10 },
  },
  {
    badgeId: "video_creator",
    name: "Video Creator",
    description: "Generate 5 D-ID videos",
    iconUrl: "🎬",
    criteria: { type: "videos_generated", count: 5 },
  },
  {
    badgeId: "community_helper",
    name: "Community Helper",
    description: "Reach top 10 on leaderboard",
    iconUrl: "🏆",
    criteria: { type: "leaderboard_rank", rank: 10 },
  },
  {
    badgeId: "early_adopter",
    name: "Early Adopter",
    description: "Use a feature in its first week of launch",
    iconUrl: "🚀",
    criteria: { type: "early_feature_use", days: 7 },
  },
  {
    badgeId: "perfectionist",
    name: "Perfectionist",
    description: "Achieve 100% test completion rate (10+ tests)",
    iconUrl: "💯",
    criteria: { type: "completion_rate", rate: 100, minTests: 10 },
  },
  {
    badgeId: "speed_demon",
    name: "Speed Demon",
    description: "Complete a test 50% faster than average",
    iconUrl: "⚡",
    criteria: { type: "speed_completion", percentage: 50 },
  },
  {
    badgeId: "wordsmith",
    name: "Wordsmith",
    description: "Write 50 detailed bug reports",
    iconUrl: "📝",
    criteria: { type: "detailed_reports", count: 50 },
  },
];

export async function initializeBadges(): Promise<void> {
  for (const badge of BADGE_DEFINITIONS) {
    const existing = await db
      .select()
      .from(gamificationBadges)
      .where(eq(gamificationBadges.badgeId, badge.badgeId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(gamificationBadges).values(badge);
    }
  }
}

export async function checkAndAwardBadges(userId: number): Promise<string[]> {
  const awardedBadges: string[] = [];
  
  for (const badge of BADGE_DEFINITIONS) {
    const hasBadge = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badge.badgeId)
        )
      )
      .limit(1);

    if (hasBadge.length > 0) {
      continue;
    }

    const qualifies = await checkBadgeCriteria(userId, badge.criteria);
    if (qualifies) {
      await db.insert(userBadges).values({
        userId,
        badgeId: badge.badgeId,
      });
      awardedBadges.push(badge.badgeId);
    }
  }

  return awardedBadges;
}

async function checkBadgeCriteria(userId: number, criteria: any): Promise<boolean> {
  const { type, count, rank, rate, minTests, days, percentage } = criteria;

  switch (type) {
    case "volunteer_tests": {
      const stats = await db
        .select()
        .from(volunteerStats)
        .where(eq(volunteerStats.userId, userId))
        .limit(1);
      return (stats[0]?.completedSessions || 0) >= count;
    }

    case "bugs_found": {
      const stats = await db
        .select()
        .from(volunteerStats)
        .where(eq(volunteerStats.userId, userId))
        .limit(1);
      return (stats[0]?.bugsFound || 0) >= count;
    }

    case "completion_rate": {
      const stats = await db
        .select()
        .from(volunteerStats)
        .where(eq(volunteerStats.userId, userId))
        .limit(1);
      
      const total = stats[0]?.totalSessions || 0;
      const completed = stats[0]?.completedSessions || 0;
      
      if (total < minTests) return false;
      return total > 0 && (completed / total) * 100 >= rate;
    }

    default:
      return false;
  }
}

export async function getUserBadges(userId: number): Promise<Badge[]> {
  const earned = await db
    .select({
      id: gamificationBadges.id,
      badgeId: gamificationBadges.badgeId,
      name: gamificationBadges.name,
      description: gamificationBadges.description,
      iconUrl: gamificationBadges.iconUrl,
      criteria: gamificationBadges.criteria,
      awardedAt: userBadges.awardedAt,
    })
    .from(userBadges)
    .innerJoin(gamificationBadges, eq(userBadges.badgeId, gamificationBadges.badgeId))
    .where(eq(userBadges.userId, userId));

  return earned;
}

export async function getAllBadges(): Promise<Badge[]> {
  const badges = await db.select().from(gamificationBadges);
  return badges;
}

export async function getBadgeProgress(
  userId: number,
  badgeId: string
): Promise<BadgeProgress> {
  const badge = BADGE_DEFINITIONS.find(b => b.badgeId === badgeId);
  if (!badge) {
    return { current: 0, required: 0, percentage: 0 };
  }

  const { type, count, rate, minTests } = badge.criteria;
  let current = 0;
  let required = count || rate || minTests || 1;

  switch (type) {
    case "volunteer_tests": {
      const stats = await db
        .select()
        .from(volunteerStats)
        .where(eq(volunteerStats.userId, userId))
        .limit(1);
      current = stats[0]?.completedSessions || 0;
      break;
    }

    case "bugs_found": {
      const stats = await db
        .select()
        .from(volunteerStats)
        .where(eq(volunteerStats.userId, userId))
        .limit(1);
      current = stats[0]?.bugsFound || 0;
      break;
    }

    default:
      current = 0;
  }

  const percentage = Math.min(100, Math.round((current / required) * 100));
  return { current, required, percentage };
}
