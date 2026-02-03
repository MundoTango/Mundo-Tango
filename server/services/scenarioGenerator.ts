/**
 * MB.MD v9.9.4 - Comprehensive Test Scenario Generator
 * Generates 150+ test scenarios covering all 412 database tables across platform domains
 * Based on: MB_MD_TESTING_PLAN_v9.9.4.md (Parts 1-4)
 */

import { db } from "../db";
import { uiTestScenarios, InsertUiTestScenario } from "@shared/schema";

export interface ScenarioDomain {
  name: string;
  priority: 'P0-CRITICAL' | 'P1-HIGH' | 'P2-MEDIUM' | 'P3-LOW';
  tablesCovered: string[];
  scenarios: InsertUiTestScenario[];
}

export class ScenarioGenerator {
  
  /**
   * Generate comprehensive test scenarios for all platform domains
   */
  async generateAllScenarios(createdBy?: number): Promise<number> {
    const domains = this.getAllDomains(createdBy);
    let totalCreated = 0;

    for (const domain of domains) {
      for (const scenario of domain.scenarios) {
        try {
          await db.insert(uiTestScenarios).values(scenario).onConflictDoNothing();
          totalCreated++;
        } catch (error) {
          console.error(`Failed to create scenario: ${scenario.title}`, error);
        }
      }
    }

    return totalCreated;
  }

  getAllDomains(createdBy?: number): ScenarioDomain[] {
    return [
      // PART 1: Critical Social Features (15 tables)
      this.getSocialPostsDomain(createdBy),
      this.getNotificationsDomain(createdBy),
      this.getFriendshipsDomain(createdBy),
      this.getCommentsReactionsDomain(createdBy),
      
      // PART 1: Groups & Events (8 tables)
      this.getGroupsDomain(createdBy),
      this.getEventsDomain(createdBy),
      this.getPlaceRecommendationsDomain(createdBy),
      
      // PART 1: Messaging (4 tables)
      this.getMessagingDomain(createdBy),
      
      // PART 2: User Profile & Account (4 tables)
      this.getProfileDomain(createdBy),
      this.getUserSettingsDomain(createdBy),
      
      // PART 2: Authentication & Security (6 tables)
      this.getAuthSecurityDomain(createdBy),
      
      // PART 2: Skills & Endorsements (2 tables)
      this.getSkillsDomain(createdBy),
      
      // PART 2: Follows & Social (3 tables)
      this.getFollowsDomain(createdBy),
      
      // PART 2: Reviews & Ratings (1 table)
      this.getReviewsDomain(createdBy),
      
      // PART 2: Live Streams (3 tables)
      this.getLiveStreamsDomain(createdBy),
      
      // PART 2: Media Gallery (2 tables)
      this.getMediaDomain(createdBy),
      
      // PART 2: Workshops (2 tables)
      this.getWorkshopsDomain(createdBy),
      
      // PART 2: Music Library (4 tables)
      this.getMusicDomain(createdBy),
      
      // PART 2: Housing (4 tables)
      this.getHousingDomain(createdBy),
      
      // PART 2: Marketplace (2 tables)
      this.getMarketplaceDomain(createdBy),
      
      // PART 2: Payments (3 tables)
      this.getPaymentsDomain(createdBy),
      
      // PART 2: Talent Match (6 tables)
      this.getTalentMatchDomain(createdBy),
      
      // PART 2: AI Chat (4 tables)
      this.getAIChatDomain(createdBy),
      
      // PART 3: Admin Moderation (3 tables)
      this.getAdminModerationDomain(createdBy),
      
      // PART 3: Admin User Management (2 tables)
      this.getAdminUsersDomain(createdBy),
      
      // PART 3: Admin Role Requests (1 table)
      this.getAdminRolesDomain(createdBy),
      
      // PART 3: Admin Events (1 table)
      this.getAdminEventsDomain(createdBy),
      
      // PART 3: Admin Scraping (3 tables)
      this.getAdminScrapingDomain(createdBy),
      
      // PART 3: Admin Analytics (4 tables)
      this.getAdminAnalyticsDomain(createdBy),
      
      // PART 3: Audit System (3 tables)
      this.getAuditDomain(createdBy),
      
      // PART 4: Financial Management (13 tables)
      this.getFinancialDomain(createdBy),
      
      // PART 4: Travel Planning (11 tables)
      this.getTravelDomain(createdBy),
      
      // PART 4: Gamification (7 tables)
      this.getGamificationDomain(createdBy),
      
      // PART 4: Life CEO (6 tables)
      this.getLifeCEODomain(createdBy),
      
      // PART 4: God-Level Content (4 tables)
      this.getGodLevelDomain(createdBy),
      
      // PART 4: Social Media Management (5 tables)
      this.getSocialMediaDomain(createdBy),
      
      // PART 4: Memories (5 tables)
      this.getMemoriesDomain(createdBy),
      
      // PART 4: Mr. Blue AI (8 tables)
      this.getMrBlueDomain(createdBy),
      
      // PART 4: H2AC Volunteer (4 tables)
      this.getH2ACDomain(createdBy),
    ];
  }

  // ===========================================
  // PART 1: CRITICAL SOCIAL FEATURES
  // ===========================================

  getSocialPostsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Social Posts',
      priority: 'P0-CRITICAL',
      tablesCovered: ['posts', 'postShares', 'savedPosts', 'reportedProfiles'],
      scenarios: [
        {
          title: "Create post with text only",
          description: "Test basic post creation - posts table",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Navigate to feed page (/feed)" },
            { step: 2, action: "Click post input area" },
            { step: 3, action: "Write post content" },
            { step: 4, action: "Submit post" },
            { step: 5, action: "Verify post appears in feed" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create post with @user mention",
          description: "Test mention parsing → notification trigger - posts.mentions, notifications",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to feed" },
            { step: 2, action: "Create new post" },
            { step: 3, action: "Type @username to mention someone" },
            { step: 4, action: "Submit post" },
            { step: 5, action: "Verify mention appears as link" },
            { step: 6, action: "Check mentioned user gets notification" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create post with @city mention",
          description: "Test city mention → city group linkage - posts.mentions, groups",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Create new post" },
            { step: 2, action: "Type @cityname (e.g., @BuenosAires)" },
            { step: 3, action: "Submit post" },
            { step: 4, action: "Navigate to city group" },
            { step: 5, action: "Verify post appears in city group feed" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create post with #hashtag",
          description: "Test hashtag parsing and searchability - posts.hashtags",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Create new post with #hashtag" },
            { step: 2, action: "Submit post" },
            { step: 3, action: "Search for the hashtag" },
            { step: 4, action: "Verify post appears in results" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create post with media gallery",
          description: "Test media upload → Cloudinary compression - posts.mediaGallery",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Create new post" },
            { step: 2, action: "Click upload media button" },
            { step: 3, action: "Select multiple images" },
            { step: 4, action: "Wait for upload completion" },
            { step: 5, action: "Submit post" },
            { step: 6, action: "Verify images display correctly" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Share post to external platform",
          description: "Test sharing flow - postShares table",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Find a post in feed" },
            { step: 2, action: "Click share button" },
            { step: 3, action: "Select share type (copy link)" },
            { step: 4, action: "Verify share counter increments" },
            { step: 5, action: "Verify link copied notification" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Save post to favorites",
          description: "Test saved posts functionality - savedPosts table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Find a post" },
            { step: 2, action: "Click bookmark/save icon" },
            { step: 3, action: "Navigate to Favorites/Saved page" },
            { step: 4, action: "Verify post appears in saved list" },
            { step: 5, action: "Unsave and verify removal" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Report a user profile",
          description: "Test user reporting flow - reportedProfiles table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Navigate to a user profile" },
            { step: 2, action: "Click report button" },
            { step: 3, action: "Select report reason" },
            { step: 4, action: "Add details" },
            { step: 5, action: "Submit report" },
            { step: 6, action: "Verify confirmation message" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getNotificationsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Notifications',
      priority: 'P0-CRITICAL',
      tablesCovered: ['notifications'],
      scenarios: [
        {
          title: "View notification badge count",
          description: "Test unread notification counting",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Look at notification bell icon" },
            { step: 2, action: "Verify badge shows unread count" },
            { step: 3, action: "Trigger an action that creates notification" },
            { step: 4, action: "Verify count updates" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Mark notification as read",
          description: "Test notification read state - notifications.isRead",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Click notification bell" },
            { step: 2, action: "View notification list" },
            { step: 3, action: "Click on a notification" },
            { step: 4, action: "Verify it's marked as read" },
            { step: 5, action: "Verify badge count decreases" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Test notification types",
          description: "Verify all notification types display correctly",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Open notification panel" },
            { step: 2, action: "Identify friend_request notifications" },
            { step: 3, action: "Identify mention notifications" },
            { step: 4, action: "Identify like notifications" },
            { step: 5, action: "Click actionUrl on each" },
            { step: 6, action: "Verify navigation to correct page" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getFriendshipsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Friendships',
      priority: 'P0-CRITICAL',
      tablesCovered: ['friendRequests', 'friendships'],
      scenarios: [
        {
          title: "Send friend request with message",
          description: "Test friend request sending - friendRequests table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Navigate to a user's profile" },
            { step: 2, action: "Click 'Add Friend' button" },
            { step: 3, action: "Add personal message" },
            { step: 4, action: "Submit request" },
            { step: 5, action: "Verify pending status shown" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Send friend request with dance story",
          description: "Test dance story attachment - friendRequests.didWeDance, danceStory",
          difficulty: "hard",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Send friend request" },
            { step: 2, action: "Toggle 'Did we dance?' option" },
            { step: 3, action: "Enter dance location" },
            { step: 4, action: "Write dance story" },
            { step: 5, action: "Upload dance photo" },
            { step: 6, action: "Submit and verify all data saved" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Accept friend request",
          description: "Test request acceptance → friendship creation",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to Friend Requests" },
            { step: 2, action: "View pending requests" },
            { step: 3, action: "Click Accept on a request" },
            { step: 4, action: "Verify friendship created" },
            { step: 5, action: "Check friend appears in friends list" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Snooze friend request",
          description: "Test snooze functionality - friendRequests.snoozedUntil",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to Friend Requests" },
            { step: 2, action: "Find a pending request" },
            { step: 3, action: "Click snooze option" },
            { step: 4, action: "Set snooze duration" },
            { step: 5, action: "Verify request hidden from main queue" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View mutual friends",
          description: "Test mutual friends calculation",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to a user profile" },
            { step: 2, action: "Find mutual friends section" },
            { step: 3, action: "Verify count displayed" },
            { step: 4, action: "Click to view mutual friends list" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Block a friend",
          description: "Test blocking functionality - friendships.status",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Navigate to friend's profile" },
            { step: 2, action: "Click block option" },
            { step: 3, action: "Confirm blocking" },
            { step: 4, action: "Verify friend removed from list" },
            { step: 5, action: "Verify blocked user can't message you" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getCommentsReactionsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Comments & Reactions',
      priority: 'P0-CRITICAL',
      tablesCovered: ['postComments', 'reactions'],
      scenarios: [
        {
          title: "Add comment to post",
          description: "Test commenting - postComments table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Find a post" },
            { step: 2, action: "Click comment input" },
            { step: 3, action: "Write comment" },
            { step: 4, action: "Submit comment" },
            { step: 5, action: "Verify comment appears" },
            { step: 6, action: "Verify post.comments counter updates" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Reply to a comment (sub-comment)",
          description: "Test nested comments - postComments.parentCommentId",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Find a post with comments" },
            { step: 2, action: "Click reply on a comment" },
            { step: 3, action: "Write reply" },
            { step: 4, action: "Submit" },
            { step: 5, action: "Verify reply appears nested under parent" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Add reaction to post",
          description: "Test 13 reaction types - reactions table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Find a post" },
            { step: 2, action: "Hover/click reaction button" },
            { step: 3, action: "Select reaction type (love/passion/fire/etc)" },
            { step: 4, action: "Verify reaction appears" },
            { step: 5, action: "Change reaction type" },
            { step: 6, action: "Remove reaction" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View reaction breakdown",
          description: "Test reaction counts by type",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Find a post with reactions" },
            { step: 2, action: "Click on reaction count" },
            { step: 3, action: "View breakdown by reaction type" },
            { step: 4, action: "See who reacted" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 1: GROUPS & EVENTS
  // ===========================================

  getGroupsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Groups & Communities',
      priority: 'P0-CRITICAL',
      tablesCovered: ['groups', 'groupMembers', 'groupPosts'],
      scenarios: [
        {
          title: "Browse city groups",
          description: "Test city group discovery - groups.type='city'",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to Groups (/groups)" },
            { step: 2, action: "Filter by 'City Groups'" },
            { step: 3, action: "Browse available cities" },
            { step: 4, action: "Click on a city group" },
            { step: 5, action: "View group details and events" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Join group as member",
          description: "Test group membership - groupMembers.role='member'",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to a group" },
            { step: 2, action: "Click 'Join' button" },
            { step: 3, action: "Select 'Join as Member'" },
            { step: 4, action: "Verify membership confirmation" },
            { step: 5, action: "Check group appears in My Groups" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Follow group (non-member)",
          description: "Test group following - groupMembers.role='follower'",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to a group" },
            { step: 2, action: "Click 'Follow' option" },
            { step: 3, action: "Verify following status" },
            { step: 4, action: "Check group posts appear in feed" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Post to group",
          description: "Test group posting - groupPosts table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Navigate to a group you're a member of" },
            { step: 2, action: "Click create post in group" },
            { step: 3, action: "Write post content" },
            { step: 4, action: "Submit post" },
            { step: 5, action: "Verify post appears in group feed" },
            { step: 6, action: "Verify group.postCount increments" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create a new group",
          description: "Test group creation flow",
          difficulty: "hard",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Navigate to Groups" },
            { step: 2, action: "Click 'Create Group'" },
            { step: 3, action: "Enter group name" },
            { step: 4, action: "Select group type (pro/general)" },
            { step: 5, action: "Add description" },
            { step: 6, action: "Upload cover image" },
            { step: 7, action: "Set privacy settings" },
            { step: 8, action: "Submit and verify creation" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getEventsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Events Management',
      priority: 'P0-CRITICAL',
      tablesCovered: ['events', 'eventSeries', 'eventRsvps', 'eventTickets'],
      scenarios: [
        {
          title: "Create a milonga event",
          description: "Test event creation - events table",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Navigate to Events (/events)" },
            { step: 2, action: "Click 'Create Event'" },
            { step: 3, action: "Enter title and description" },
            { step: 4, action: "Select eventType='milonga'" },
            { step: 5, action: "Set startDate and endDate" },
            { step: 6, action: "Add venue with city (triggers city group link)" },
            { step: 7, action: "Set ticket price" },
            { step: 8, action: "Upload event image" },
            { step: 9, action: "Submit and verify groupId auto-linked" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create recurring event series",
          description: "Test event series - eventSeries table",
          difficulty: "hard",
          estimatedMinutes: 18,
          steps: [
            { step: 1, action: "Create new event" },
            { step: 2, action: "Enable 'Recurring Event'" },
            { step: 3, action: "Select recurrence (weekly)" },
            { step: 4, action: "Set series end date" },
            { step: 5, action: "Complete event details" },
            { step: 6, action: "Submit" },
            { step: 7, action: "Verify eventSeries created" },
            { step: 8, action: "Verify all instances have seriesId" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "RSVP to event",
          description: "Test event registration - eventRsvps table",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Browse events" },
            { step: 2, action: "Click on event details" },
            { step: 3, action: "Click RSVP/Register" },
            { step: 4, action: "Confirm attendance" },
            { step: 5, action: "Verify in 'My Events'" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Purchase event ticket",
          description: "Test ticketed events - eventTickets table",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Find a paid event" },
            { step: 2, action: "Click 'Buy Tickets'" },
            { step: 3, action: "Select ticket quantity" },
            { step: 4, action: "Proceed to checkout" },
            { step: 5, action: "Complete payment (test card)" },
            { step: 6, action: "Verify ticket in profile" },
            { step: 7, action: "Access ticket QR code" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Use event map view",
          description: "Test map-based event discovery",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to events map view" },
            { step: 2, action: "Allow/enter location" },
            { step: 3, action: "View event markers on map" },
            { step: 4, action: "Filter by event type" },
            { step: 5, action: "Click marker to view event" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Search events by city",
          description: "Test event filtering by location",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to events page" },
            { step: 2, action: "Use city filter/search" },
            { step: 3, action: "Select a city" },
            { step: 4, action: "Verify filtered results" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getPlaceRecommendationsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Place Recommendations',
      priority: 'P1-HIGH',
      tablesCovered: ['placeRecommendations'],
      scenarios: [
        {
          title: "Create place recommendation",
          description: "Test recommendation creation - placeRecommendations table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Create a post with location" },
            { step: 2, action: "Add recommendation for venue/restaurant" },
            { step: 3, action: "Select category (venue/teacher/restaurant)" },
            { step: 4, action: "Add description" },
            { step: 5, action: "Submit" },
            { step: 6, action: "Verify recommendation created" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View recommendations on map",
          description: "Test map view of recommendations",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Navigate to recommendations/places" },
            { step: 2, action: "Switch to map view" },
            { step: 3, action: "View markers by category" },
            { step: 4, action: "Click marker to see details" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Test recommendation deduplication",
          description: "Verify same lat/lng increments count vs creates duplicate",
          difficulty: "hard",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Create recommendation for a venue" },
            { step: 2, action: "Note the venue location" },
            { step: 3, action: "Create another recommendation for same place" },
            { step: 4, action: "Verify recommendationCount increments" },
            { step: 5, action: "Verify no duplicate created" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 1: MESSAGING
  // ===========================================

  getMessagingDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Direct Messaging',
      priority: 'P0-CRITICAL',
      tablesCovered: ['directMessages', 'directMessageReactions', 'conversations'],
      scenarios: [
        {
          title: "Send direct message",
          description: "Test DM sending - directMessages table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to Messages (/messages)" },
            { step: 2, action: "Click 'New Message'" },
            { step: 3, action: "Select recipient" },
            { step: 4, action: "Type message" },
            { step: 5, action: "Send and verify delivery" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Send message with media",
          description: "Test media attachments - directMessages.mediaUrl",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Open conversation" },
            { step: 2, action: "Click attach media" },
            { step: 3, action: "Select image/video" },
            { step: 4, action: "Add optional text" },
            { step: 5, action: "Send and verify media displays" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "React to message",
          description: "Test message reactions - directMessageReactions table",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Open conversation" },
            { step: 2, action: "Hover on a message" },
            { step: 3, action: "Click reaction button" },
            { step: 4, action: "Select reaction" },
            { step: 5, action: "Verify reaction appears" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Mark conversation as read",
          description: "Test read status - directMessages.isRead",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Open messages list" },
            { step: 2, action: "Identify unread conversation" },
            { step: 3, action: "Open conversation" },
            { step: 4, action: "Verify messages marked read" },
            { step: 5, action: "Check unread badge updates" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Use unified inbox",
          description: "Test unified messaging across sources",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to unified inbox" },
            { step: 2, action: "View messages from all sources" },
            { step: 3, action: "Filter by source type" },
            { step: 4, action: "Reply to message" },
            { step: 5, action: "Archive message" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: USER PROFILE & SETTINGS
  // ===========================================

  getProfileDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Profile Management',
      priority: 'P0-CRITICAL',
      tablesCovered: ['users', 'userLocationHistory'],
      scenarios: [
        {
          title: "Update profile bio and info",
          description: "Test profile editing - users table",
          difficulty: "easy",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Navigate to profile" },
            { step: 2, action: "Click 'Edit Profile'" },
            { step: 3, action: "Update bio" },
            { step: 4, action: "Change profile photo" },
            { step: 5, action: "Save changes" },
            { step: 6, action: "Verify updates display" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Update city (triggers city group)",
          description: "Test city update → group normalization - users.city, groups",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Edit profile" },
            { step: 2, action: "Change city to new location" },
            { step: 3, action: "Save profile" },
            { step: 4, action: "Verify city group created/linked" },
            { step: 5, action: "Check userLocationHistory updated" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Update tango roles and levels",
          description: "Test tango profile fields - users.tangoRoles, leaderLevel, followerLevel",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Edit profile" },
            { step: 2, action: "Set tango roles (leader/follower)" },
            { step: 3, action: "Set leader level (0-10)" },
            { step: 4, action: "Set follower level (0-10)" },
            { step: 5, action: "Save and verify" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Set custom profile URL",
          description: "Test custom URL - users.customUrl",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to profile settings" },
            { step: 2, action: "Enter custom URL slug" },
            { step: 3, action: "Check availability" },
            { step: 4, action: "Save" },
            { step: 5, action: "Verify custom URL works" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View location history",
          description: "Test location history - userLocationHistory table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to profile" },
            { step: 2, action: "Find location history section" },
            { step: 3, action: "View past cities" },
            { step: 4, action: "See dates at each location" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getUserSettingsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'User Settings',
      priority: 'P1-HIGH',
      tablesCovered: ['userSettings'],
      scenarios: [
        {
          title: "Toggle email notifications",
          description: "Test notification settings - userSettings.emailNotifications",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to Settings" },
            { step: 2, action: "Find notification settings" },
            { step: 3, action: "Toggle email notifications" },
            { step: 4, action: "Save settings" },
            { step: 5, action: "Verify setting persisted" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Change profile visibility",
          description: "Test privacy settings - userSettings.profileVisibility",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Go to privacy settings" },
            { step: 2, action: "Change visibility (public/friends/private)" },
            { step: 3, action: "Save" },
            { step: 4, action: "Test from logged out view" },
            { step: 5, action: "Verify access control applied" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Change app theme",
          description: "Test theme switching - userSettings.theme",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Find theme settings" },
            { step: 2, action: "Switch between light/dark/system" },
            { step: 3, action: "Verify UI updates" },
            { step: 4, action: "Verify setting persists on reload" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Change app language",
          description: "Test language switching - userSettings.language",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Find language settings" },
            { step: 2, action: "Select different language" },
            { step: 3, action: "Save" },
            { step: 4, action: "Verify UI text changes" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: AUTHENTICATION & SECURITY
  // ===========================================

  getAuthSecurityDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Authentication & Security',
      priority: 'P0-CRITICAL',
      tablesCovered: ['refreshTokens', 'emailVerificationTokens', 'passwordResetTokens', 'twoFactorSecrets', 'securityAuditLogs'],
      scenarios: [
        {
          title: "Login and logout flow",
          description: "Test authentication - refreshTokens table",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to login page" },
            { step: 2, action: "Enter credentials" },
            { step: 3, action: "Submit login" },
            { step: 4, action: "Verify logged in state" },
            { step: 5, action: "Click logout" },
            { step: 6, action: "Verify logged out" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Request password reset",
          description: "Test password reset flow - passwordResetTokens table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Go to login page" },
            { step: 2, action: "Click 'Forgot Password'" },
            { step: 3, action: "Enter email" },
            { step: 4, action: "Submit request" },
            { step: 5, action: "Verify email sent message" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Enable two-factor authentication",
          description: "Test 2FA setup - twoFactorSecrets table",
          difficulty: "hard",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Go to security settings" },
            { step: 2, action: "Click 'Enable 2FA'" },
            { step: 3, action: "Scan QR code with authenticator app" },
            { step: 4, action: "Enter verification code" },
            { step: 5, action: "Save backup codes" },
            { step: 6, action: "Verify 2FA enabled" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View security audit log",
          description: "Test audit log viewing - securityAuditLogs table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to security settings" },
            { step: 2, action: "Find 'Security Activity' or 'Audit Log'" },
            { step: 3, action: "View recent login events" },
            { step: 4, action: "Check device/location info" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: SKILLS & ENDORSEMENTS
  // ===========================================

  getSkillsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Skills & Endorsements',
      priority: 'P2-MEDIUM',
      tablesCovered: ['userSkills', 'skillEndorsements'],
      scenarios: [
        {
          title: "Add skill to profile",
          description: "Test skill addition - userSkills table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Edit profile" },
            { step: 2, action: "Find skills section" },
            { step: 3, action: "Add new skill" },
            { step: 4, action: "Set skill level" },
            { step: 5, action: "Save and verify display" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Endorse friend's skill",
          description: "Test skill endorsements - skillEndorsements table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Visit friend's profile" },
            { step: 2, action: "Find skills section" },
            { step: 3, action: "Click endorse on a skill" },
            { step: 4, action: "Verify endorsement count increases" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: FOLLOWS & SOCIAL
  // ===========================================

  getFollowsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Follows & Blocks',
      priority: 'P1-HIGH',
      tablesCovered: ['follows', 'blockedUsers', 'profileViews'],
      scenarios: [
        {
          title: "Follow a user",
          description: "Test following - follows table",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Visit user profile" },
            { step: 2, action: "Click 'Follow' button" },
            { step: 3, action: "Verify following status" },
            { step: 4, action: "Check their posts in your feed" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Block a user",
          description: "Test blocking - blockedUsers table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Visit user profile" },
            { step: 2, action: "Click block option" },
            { step: 3, action: "Confirm blocking" },
            { step: 4, action: "Verify user hidden from feed" },
            { step: 5, action: "Verify can't message you" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View profile analytics",
          description: "Test profile views tracking - profileViews table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to your profile" },
            { step: 2, action: "Find analytics/insights section" },
            { step: 3, action: "View profile view count" },
            { step: 4, action: "See view trends" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: REVIEWS & RATINGS
  // ===========================================

  getReviewsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Reviews & Ratings',
      priority: 'P1-HIGH',
      tablesCovered: ['reviews'],
      scenarios: [
        {
          title: "Write event review",
          description: "Test review creation - reviews table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Go to past event" },
            { step: 2, action: "Click 'Write Review'" },
            { step: 3, action: "Select star rating" },
            { step: 4, action: "Write review content" },
            { step: 5, action: "Submit review" },
            { step: 6, action: "Verify review displays" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Mark review as helpful",
          description: "Test review helpfulness - reviews.helpfulCount",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "View reviews on event/venue" },
            { step: 2, action: "Find a review" },
            { step: 3, action: "Click 'Helpful' button" },
            { step: 4, action: "Verify count increases" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: LIVE STREAMS
  // ===========================================

  getLiveStreamsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Live Streams',
      priority: 'P2-MEDIUM',
      tablesCovered: ['liveStreams', 'streamViewers', 'liveStreamMessages'],
      scenarios: [
        {
          title: "Schedule live stream",
          description: "Test stream scheduling - liveStreams table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to Live section" },
            { step: 2, action: "Click 'Schedule Stream'" },
            { step: 3, action: "Enter stream title" },
            { step: 4, action: "Set scheduled date/time" },
            { step: 5, action: "Add description" },
            { step: 6, action: "Save and verify scheduled" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Join live stream",
          description: "Test stream viewing - streamViewers table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Find active live stream" },
            { step: 2, action: "Click to join" },
            { step: 3, action: "Verify video plays" },
            { step: 4, action: "Check viewer count" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Send chat message in stream",
          description: "Test stream chat - liveStreamMessages table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Join a live stream" },
            { step: 2, action: "Find chat input" },
            { step: 3, action: "Type message" },
            { step: 4, action: "Send and verify appears in chat" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: MEDIA GALLERY
  // ===========================================

  getMediaDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Media Gallery',
      priority: 'P1-HIGH',
      tablesCovered: ['media', 'storyViews'],
      scenarios: [
        {
          title: "Upload media to gallery",
          description: "Test media upload - media table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Go to profile gallery" },
            { step: 2, action: "Click upload" },
            { step: 3, action: "Select image/video" },
            { step: 4, action: "Add caption" },
            { step: 5, action: "Upload and verify display" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View story and track view",
          description: "Test story views - storyViews table",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Find user with active story" },
            { step: 2, action: "Click on story avatar" },
            { step: 3, action: "View story content" },
            { step: 4, action: "Verify view counted" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: WORKSHOPS
  // ===========================================

  getWorkshopsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Workshops',
      priority: 'P1-HIGH',
      tablesCovered: ['workshops', 'workshopEnrollments'],
      scenarios: [
        {
          title: "Browse and enroll in workshop",
          description: "Test workshop enrollment - workshops, workshopEnrollments",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to Workshops" },
            { step: 2, action: "Browse available workshops" },
            { step: 3, action: "Filter by type/location" },
            { step: 4, action: "View workshop details" },
            { step: 5, action: "Click 'Enroll'" },
            { step: 6, action: "Complete enrollment" },
            { step: 7, action: "Verify in My Workshops" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Cancel workshop enrollment",
          description: "Test enrollment cancellation",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to My Workshops" },
            { step: 2, action: "Find enrolled workshop" },
            { step: 3, action: "Click 'Cancel Enrollment'" },
            { step: 4, action: "Confirm cancellation" },
            { step: 5, action: "Verify removed from list" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: MUSIC LIBRARY
  // ===========================================

  getMusicDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Music Library',
      priority: 'P2-MEDIUM',
      tablesCovered: ['musicLibrary', 'playlists', 'playlistSongs', 'musicFavorites'],
      scenarios: [
        {
          title: "Browse music library",
          description: "Test music browsing - musicLibrary table",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to Music" },
            { step: 2, action: "Browse by orchestra" },
            { step: 3, action: "Search for song" },
            { step: 4, action: "Play preview" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create playlist",
          description: "Test playlist creation - playlists, playlistSongs",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Click 'Create Playlist'" },
            { step: 2, action: "Name playlist" },
            { step: 3, action: "Add songs from library" },
            { step: 4, action: "Reorder songs" },
            { step: 5, action: "Save playlist" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Favorite a song",
          description: "Test favorites - musicFavorites table",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Find a song" },
            { step: 2, action: "Click heart/favorite icon" },
            { step: 3, action: "Go to favorites" },
            { step: 4, action: "Verify song appears" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: HOUSING
  // ===========================================

  getHousingDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Housing & Accommodations',
      priority: 'P0-CRITICAL',
      tablesCovered: ['housingListings', 'housingBookings', 'housingReviews', 'housingFavorites'],
      scenarios: [
        {
          title: "Create housing listing",
          description: "Test listing creation - housingListings table",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Navigate to Housing" },
            { step: 2, action: "Click 'List Your Space'" },
            { step: 3, action: "Enter title and description" },
            { step: 4, action: "Set location" },
            { step: 5, action: "Set price per night" },
            { step: 6, action: "Add amenities" },
            { step: 7, action: "Upload photos" },
            { step: 8, action: "Set availability" },
            { step: 9, action: "Publish listing" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Search and book housing",
          description: "Test booking flow - housingBookings table",
          difficulty: "hard",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Search housing by city" },
            { step: 2, action: "Filter by dates" },
            { step: 3, action: "Filter by price/amenities" },
            { step: 4, action: "View listing details" },
            { step: 5, action: "Click 'Book'" },
            { step: 6, action: "Select dates" },
            { step: 7, action: "Send booking request" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Leave housing review",
          description: "Test housing reviews - housingReviews table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Go to past booking" },
            { step: 2, action: "Click 'Leave Review'" },
            { step: 3, action: "Rate stay (1-5 stars)" },
            { step: 4, action: "Write review" },
            { step: 5, action: "Submit" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Save housing to favorites",
          description: "Test housing favorites - housingFavorites table",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "View housing listing" },
            { step: 2, action: "Click heart/save icon" },
            { step: 3, action: "Go to saved listings" },
            { step: 4, action: "Verify listing appears" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: MARKETPLACE
  // ===========================================

  getMarketplaceDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Marketplace',
      priority: 'P1-HIGH',
      tablesCovered: ['marketplaceItems', 'marketplaceProducts'],
      scenarios: [
        {
          title: "List item for sale",
          description: "Test listing creation - marketplaceItems table",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Navigate to Marketplace" },
            { step: 2, action: "Click 'Sell Item'" },
            { step: 3, action: "Select category (shoes/clothing)" },
            { step: 4, action: "Enter title and description" },
            { step: 5, action: "Set condition" },
            { step: 6, action: "Set price" },
            { step: 7, action: "Upload photos" },
            { step: 8, action: "Publish listing" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Browse and contact seller",
          description: "Test marketplace browsing",
          difficulty: "easy",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Browse marketplace" },
            { step: 2, action: "Filter by category" },
            { step: 3, action: "View item details" },
            { step: 4, action: "Click 'Contact Seller'" },
            { step: 5, action: "Send inquiry message" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Mark item as sold",
          description: "Test item status update - marketplaceItems.status",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Go to your listings" },
            { step: 2, action: "Find active listing" },
            { step: 3, action: "Click 'Mark as Sold'" },
            { step: 4, action: "Verify status changed" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: PAYMENTS
  // ===========================================

  getPaymentsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Payments & Subscriptions',
      priority: 'P0-CRITICAL',
      tablesCovered: ['payments', 'subscriptions', 'subscriptionPlans'],
      scenarios: [
        {
          title: "View subscription plans",
          description: "Test pricing display - subscriptionPlans table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to Pricing" },
            { step: 2, action: "View available plans" },
            { step: 3, action: "Compare features" },
            { step: 4, action: "Click on a plan" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Subscribe to premium plan",
          description: "Test subscription flow - subscriptions, payments",
          difficulty: "hard",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Select premium plan" },
            { step: 2, action: "Click 'Subscribe'" },
            { step: 3, action: "Enter payment info (test card 4242...)" },
            { step: 4, action: "Complete payment" },
            { step: 5, action: "Verify subscription active" },
            { step: 6, action: "Check premium features unlocked" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View billing history",
          description: "Test payment history - payments table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to Billing settings" },
            { step: 2, action: "View payment history" },
            { step: 3, action: "Download invoice" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Cancel subscription",
          description: "Test subscription cancellation",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to subscription settings" },
            { step: 2, action: "Click 'Cancel Subscription'" },
            { step: 3, action: "Confirm cancellation" },
            { step: 4, action: "Verify end date shown" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: TALENT MATCH
  // ===========================================

  getTalentMatchDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Talent Match',
      priority: 'P1-HIGH',
      tablesCovered: ['volunteers', 'resumes', 'tasks', 'assignments', 'talentProfiles', 'talentMatches'],
      scenarios: [
        {
          title: "Register as volunteer",
          description: "Test volunteer registration - volunteers table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to Volunteer section" },
            { step: 2, action: "Click 'Become a Volunteer'" },
            { step: 3, action: "Fill out profile" },
            { step: 4, action: "Select skills" },
            { step: 5, action: "Set availability" },
            { step: 6, action: "Submit registration" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Upload resume for AI parsing",
          description: "Test resume upload - resumes table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Go to volunteer profile" },
            { step: 2, action: "Click 'Upload Resume'" },
            { step: 3, action: "Select PDF file" },
            { step: 4, action: "Upload" },
            { step: 5, action: "Wait for AI parsing" },
            { step: 6, action: "Verify extracted skills" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View available tasks",
          description: "Test task browsing - tasks table",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to Tasks" },
            { step: 2, action: "Filter by domain" },
            { step: 3, action: "View task details" },
            { step: 4, action: "Check required skills" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Apply for task assignment",
          description: "Test task assignment - assignments table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Find matching task" },
            { step: 2, action: "Click 'Apply'" },
            { step: 3, action: "Add application note" },
            { step: 4, action: "Submit" },
            { step: 5, action: "Verify pending status" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 2: AI CHAT
  // ===========================================

  getAIChatDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'AI Chat Systems',
      priority: 'P1-HIGH',
      tablesCovered: ['mrBlueConversations', 'mrBlueMessages', 'lifeCeoConversations', 'lifeCeoChatMessages'],
      scenarios: [
        {
          title: "Start conversation with Mr. Blue",
          description: "Test Mr. Blue AI - mrBlueConversations, mrBlueMessages",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to Mr. Blue" },
            { step: 2, action: "Start new conversation" },
            { step: 3, action: "Type question" },
            { step: 4, action: "Send message" },
            { step: 5, action: "Wait for AI response" },
            { step: 6, action: "Verify response relevance" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Delete AI conversation",
          description: "Test conversation deletion",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "View conversation list" },
            { step: 2, action: "Select conversation" },
            { step: 3, action: "Click delete" },
            { step: 4, action: "Confirm deletion" },
            { step: 5, action: "Verify removed" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 3: ADMIN MODERATION
  // ===========================================

  getAdminModerationDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Admin Moderation',
      priority: 'P0-CRITICAL',
      tablesCovered: ['moderationQueue', 'moderationActions', 'flaggedContent'],
      scenarios: [
        {
          title: "View moderation queue",
          description: "Test moderation queue - moderationQueue table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to Admin (/admin)" },
            { step: 2, action: "Go to Moderation Queue" },
            { step: 3, action: "View pending items" },
            { step: 4, action: "Filter by status" },
            { step: 5, action: "Filter by content type" },
            { step: 6, action: "Sort by priority" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Take moderation action",
          description: "Test moderation actions - moderationActions table",
          difficulty: "hard",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Select queue item" },
            { step: 2, action: "Review content" },
            { step: 3, action: "Add moderator notes" },
            { step: 4, action: "Select action (approve/remove/warn)" },
            { step: 5, action: "Execute action" },
            { step: 6, action: "Verify action logged" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Review auto-flagged content",
          description: "Test auto-detection - flaggedContent table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Go to Flagged Content" },
            { step: 2, action: "Filter by flag type" },
            { step: 3, action: "Sort by severity" },
            { step: 4, action: "Review flagged item" },
            { step: 5, action: "Approve or remove" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View moderation audit log",
          description: "Test audit trail viewing",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to Moderation Audit Log" },
            { step: 2, action: "Filter by moderator" },
            { step: 3, action: "Filter by action type" },
            { step: 4, action: "View action details" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getAdminUsersDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Admin User Management',
      priority: 'P0-CRITICAL',
      tablesCovered: ['users', 'userReports'],
      scenarios: [
        {
          title: "Search and view user (Admin)",
          description: "Test user management - users table (admin view)",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to Admin Users" },
            { step: 2, action: "Search by name/email" },
            { step: 3, action: "View user details" },
            { step: 4, action: "Check user role" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Update user role (Admin)",
          description: "Test role management",
          difficulty: "hard",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Find user in admin panel" },
            { step: 2, action: "Click Edit" },
            { step: 3, action: "Change role" },
            { step: 4, action: "Save changes" },
            { step: 5, action: "Verify role updated" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Review user report (Admin)",
          description: "Test user reports - userReports table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Go to User Reports" },
            { step: 2, action: "Filter by severity" },
            { step: 3, action: "View report details" },
            { step: 4, action: "View evidence" },
            { step: 5, action: "Take action (warn/suspend/ban)" },
            { step: 6, action: "Add resolution notes" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Suspend user (Admin)",
          description: "Test user suspension",
          difficulty: "hard",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Find problematic user" },
            { step: 2, action: "Click Suspend" },
            { step: 3, action: "Set duration" },
            { step: 4, action: "Add reason" },
            { step: 5, action: "Confirm suspension" },
            { step: 6, action: "Verify user suspended" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getAdminRolesDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Admin Role Requests',
      priority: 'P1-HIGH',
      tablesCovered: ['roleRequests'],
      scenarios: [
        {
          title: "Review role request (Admin)",
          description: "Test role request handling - roleRequests table",
          difficulty: "hard",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Go to Admin Role Requests" },
            { step: 2, action: "Filter by requested role" },
            { step: 3, action: "View request details" },
            { step: 4, action: "Review credentials" },
            { step: 5, action: "Review experience" },
            { step: 6, action: "Approve or reject" },
            { step: 7, action: "Add notes" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getAdminEventsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Admin Event Approvals',
      priority: 'P1-HIGH',
      tablesCovered: ['events'],
      scenarios: [
        {
          title: "Approve pending event (Admin)",
          description: "Test event approval flow",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Go to Event Approvals" },
            { step: 2, action: "View pending events" },
            { step: 3, action: "Review event details" },
            { step: 4, action: "Check organizer profile" },
            { step: 5, action: "Approve event" },
            { step: 6, action: "Verify published" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Reject event with reason (Admin)",
          description: "Test event rejection",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Find pending event" },
            { step: 2, action: "Click Reject" },
            { step: 3, action: "Enter rejection reason" },
            { step: 4, action: "Confirm rejection" },
            { step: 5, action: "Verify organizer notified" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getAdminScrapingDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Admin Scraping',
      priority: 'P1-HIGH',
      tablesCovered: ['scrapedEvents', 'eventScrapingSources', 'eventClaims'],
      scenarios: [
        {
          title: "Trigger scraping workflow (Admin)",
          description: "Test scraping trigger - scrapedEvents table",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Go to Admin Scraping" },
            { step: 2, action: "View scraping status" },
            { step: 3, action: "Click 'Run Scrapers'" },
            { step: 4, action: "Monitor progress" },
            { step: 5, action: "View scraped events count" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Review scraped event (Admin)",
          description: "Test scraped event approval",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "View pending scraped events" },
            { step: 2, action: "Review event details" },
            { step: 3, action: "Check city normalization" },
            { step: 4, action: "Approve to publish" },
            { step: 5, action: "Verify event in main events" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Manage scraping sources (Admin)",
          description: "Test source management - eventScrapingSources table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Go to Scraping Sources" },
            { step: 2, action: "View active sources" },
            { step: 3, action: "Toggle source active status" },
            { step: 4, action: "View scrape statistics" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getAdminAnalyticsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Admin Analytics',
      priority: 'P1-HIGH',
      tablesCovered: ['analyticsEvents', 'dailyStats', 'platformMetrics'],
      scenarios: [
        {
          title: "View platform analytics (Admin)",
          description: "Test analytics dashboard",
          difficulty: "easy",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Go to Admin Analytics" },
            { step: 2, action: "View user growth chart" },
            { step: 3, action: "View engagement metrics" },
            { step: 4, action: "Change time range (7d/30d/90d)" },
            { step: 5, action: "View demographics" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View real-time activity (Admin)",
          description: "Test real-time metrics",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to Real-time Analytics" },
            { step: 2, action: "View active users" },
            { step: 3, action: "View posts in last hour" },
            { step: 4, action: "View events in last hour" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Export analytics report (Admin)",
          description: "Test report export",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to Analytics" },
            { step: 2, action: "Set date range" },
            { step: 3, action: "Click Export" },
            { step: 4, action: "Download CSV" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getAuditDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Audit System',
      priority: 'P1-HIGH',
      tablesCovered: ['auditLogs', 'suspensionLogs', 'pageInventory'],
      scenarios: [
        {
          title: "View admin audit logs",
          description: "Test audit log viewing - auditLogs table",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to Admin Audit Logs" },
            { step: 2, action: "Filter by admin user" },
            { step: 3, action: "Filter by action type" },
            { step: 4, action: "View action details" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View suspension history",
          description: "Test suspension logs - suspensionLogs table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to Suspension Logs" },
            { step: 2, action: "Filter active suspensions" },
            { step: 3, action: "View suspension details" },
            { step: 4, action: "Check end dates" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: FINANCIAL MANAGEMENT (13 tables)
  // ===========================================

  getFinancialDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Financial Management',
      priority: 'P0-CRITICAL',
      tablesCovered: ['financialPortfolios', 'financialAccounts', 'financialAssets', 'financialTrades', 
                      'financialStrategies', 'financialMarketData', 'financialAIDecisions', 
                      'financialRiskMetrics', 'financialAgents', 'financialMonitoring',
                      'financialGoals', 'financialTransactions', 'investments'],
      scenarios: [
        {
          title: "Create investment portfolio",
          description: "Test portfolio creation - financialPortfolios table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to Finance section" },
            { step: 2, action: "Click 'Create Portfolio'" },
            { step: 3, action: "Name portfolio" },
            { step: 4, action: "Select type (personal/business)" },
            { step: 5, action: "Set initial cash balance" },
            { step: 6, action: "Save and verify" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Connect external account",
          description: "Test account connection - financialAccounts table",
          difficulty: "hard",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Go to Accounts" },
            { step: 2, action: "Click 'Connect Account'" },
            { step: 3, action: "Select provider" },
            { step: 4, action: "Authenticate" },
            { step: 5, action: "Verify account connected" },
            { step: 6, action: "Check balance synced" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Execute trade (buy)",
          description: "Test trade execution - financialTrades table",
          difficulty: "hard",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Go to portfolio" },
            { step: 2, action: "Click 'Trade'" },
            { step: 3, action: "Select asset symbol" },
            { step: 4, action: "Enter quantity" },
            { step: 5, action: "Review price" },
            { step: 6, action: "Execute buy" },
            { step: 7, action: "Verify asset added to portfolio" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View portfolio risk metrics",
          description: "Test risk analysis - financialRiskMetrics table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Open portfolio" },
            { step: 2, action: "Go to Risk Analysis" },
            { step: 3, action: "View Sharpe ratio" },
            { step: 4, action: "View max drawdown" },
            { step: 5, action: "Check asset exposure" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Set financial goal",
          description: "Test goal tracking - financialGoals table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Navigate to Goals" },
            { step: 2, action: "Click 'Add Goal'" },
            { step: 3, action: "Set target amount" },
            { step: 4, action: "Set target date" },
            { step: 5, action: "Save goal" },
            { step: 6, action: "Track progress" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View AI trading decisions",
          description: "Test AI decisions log - financialAIDecisions table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Go to AI Decisions" },
            { step: 2, action: "View recent decisions" },
            { step: 3, action: "Check reasoning" },
            { step: 4, action: "Filter by agent" },
            { step: 5, action: "View confidence scores" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: TRAVEL PLANNING (11 tables)
  // ===========================================

  getTravelDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Travel Planning',
      priority: 'P0-CRITICAL',
      tablesCovered: ['travelPlans', 'travelPlanItems', 'tripJoinRequests', 'travelPreferencesProfiles',
                      'travelSearches', 'tripPlans', 'travelBookings', 'tripItineraryItems',
                      'travelPreferences', 'travelBuddies', 'travelAlerts'],
      scenarios: [
        {
          title: "Create travel plan",
          description: "Test trip creation - travelPlans table",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Navigate to Travel" },
            { step: 2, action: "Click 'Plan Trip'" },
            { step: 3, action: "Enter destination city" },
            { step: 4, action: "Set travel dates" },
            { step: 5, action: "Set budget" },
            { step: 6, action: "Add interests (milongas/festivals)" },
            { step: 7, action: "Save trip" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Add itinerary items",
          description: "Test itinerary management - travelPlanItems table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Open trip plan" },
            { step: 2, action: "Add accommodation" },
            { step: 3, action: "Add transport" },
            { step: 4, action: "Link tango event" },
            { step: 5, action: "Reorder items" },
            { step: 6, action: "Calculate total cost" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Request to join trip",
          description: "Test trip join requests - tripJoinRequests table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Find public trip" },
            { step: 2, action: "Click 'Request to Join'" },
            { step: 3, action: "Add message" },
            { step: 4, action: "Submit request" },
            { step: 5, action: "Verify pending status" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Set travel preferences",
          description: "Test preferences - travelPreferences table",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to Travel Settings" },
            { step: 2, action: "Set accommodation preferences" },
            { step: 3, action: "Set travel style" },
            { step: 4, action: "Set budget range" },
            { step: 5, action: "Save preferences" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Add travel buddy",
          description: "Test buddy system - travelBuddies table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Open trip plan" },
            { step: 2, action: "Click 'Add Buddy'" },
            { step: 3, action: "Search for friend" },
            { step: 4, action: "Send invite" },
            { step: 5, action: "Verify buddy added" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Set price alert",
          description: "Test travel alerts - travelAlerts table",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Search for flights/hotels" },
            { step: 2, action: "Click 'Set Alert'" },
            { step: 3, action: "Set target price" },
            { step: 4, action: "Enable notifications" },
            { step: 5, action: "Save alert" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: GAMIFICATION (7 tables)
  // ===========================================

  getGamificationDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Gamification System',
      priority: 'P1-HIGH',
      tablesCovered: ['achievements', 'userAchievements', 'userPoints', 'gamificationPoints',
                      'gamificationBadges', 'userBadges', 'autonomyProgress'],
      scenarios: [
        {
          title: "View achievements list",
          description: "Test achievements display - achievements table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to Achievements" },
            { step: 2, action: "View available achievements" },
            { step: 3, action: "Filter by category" },
            { step: 4, action: "Filter by rarity" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Track achievement progress",
          description: "Test progress tracking - userAchievements table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "View your achievements" },
            { step: 2, action: "Check progress bars" },
            { step: 3, action: "See unlocked vs locked" },
            { step: 4, action: "View next milestone" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View points breakdown",
          description: "Test points system - userPoints table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to Points/XP page" },
            { step: 2, action: "View total points" },
            { step: 3, action: "See points by category" },
            { step: 4, action: "Check current level" },
            { step: 5, action: "View progress to next level" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View leaderboard",
          description: "Test leaderboard ranking",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to Leaderboard" },
            { step: 2, action: "View top users" },
            { step: 3, action: "Find your position" },
            { step: 4, action: "Filter by time period" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Display badges on profile",
          description: "Test badge display - userBadges table",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to badge settings" },
            { step: 2, action: "Select badges to display" },
            { step: 3, action: "Reorder displayed badges" },
            { step: 4, action: "Save" },
            { step: 5, action: "Verify on profile" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: LIFE CEO (6 tables)
  // ===========================================

  getLifeCEODomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Life CEO AI',
      priority: 'P1-HIGH',
      tablesCovered: ['lifeCeoDomains', 'lifeCeoGoals', 'lifeCeoTasks', 'lifeCeoMilestones',
                      'lifeCeoRecommendations', 'lifeCeoConversations'],
      scenarios: [
        {
          title: "Select Life CEO domain",
          description: "Test 16-domain system - lifeCeoDomains table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Navigate to Life CEO" },
            { step: 2, action: "View 16 life domains" },
            { step: 3, action: "Select a domain (Health/Finance/etc)" },
            { step: 4, action: "View domain dashboard" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create life goal",
          description: "Test goal creation - lifeCeoGoals table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Open Life CEO" },
            { step: 2, action: "Select domain" },
            { step: 3, action: "Click 'Add Goal'" },
            { step: 4, action: "Enter goal title" },
            { step: 5, action: "Set target date" },
            { step: 6, action: "Set priority" },
            { step: 7, action: "Save goal" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Add task for goal",
          description: "Test task creation - lifeCeoTasks table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Open a goal" },
            { step: 2, action: "Click 'Add Task'" },
            { step: 3, action: "Enter task details" },
            { step: 4, action: "Set due date" },
            { step: 5, action: "Set time estimate" },
            { step: 6, action: "Save task" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Add milestone to goal",
          description: "Test milestones - lifeCeoMilestones table",
          difficulty: "medium",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Open a goal" },
            { step: 2, action: "Click 'Add Milestone'" },
            { step: 3, action: "Enter milestone" },
            { step: 4, action: "Set target date" },
            { step: 5, action: "Save" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Get AI recommendations",
          description: "Test AI coaching - lifeCeoRecommendations table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Open domain dashboard" },
            { step: 2, action: "Click 'Get Recommendations'" },
            { step: 3, action: "Wait for AI analysis" },
            { step: 4, action: "Review suggestions" },
            { step: 5, action: "Accept/dismiss recommendations" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Chat with Life CEO AI",
          description: "Test Life CEO chat - lifeCeoConversations table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Open Life CEO chat" },
            { step: 2, action: "Ask about a domain" },
            { step: 3, action: "Get personalized advice" },
            { step: 4, action: "Follow up questions" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: GOD-LEVEL CONTENT (4 tables)
  // ===========================================

  getGodLevelDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'God-Level Content',
      priority: 'P1-HIGH',
      tablesCovered: ['godLevelQuotas', 'lumaVideos', 'voiceClones', 'didVideos'],
      scenarios: [
        {
          title: "Check content quota",
          description: "Test quota system - godLevelQuotas table",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Navigate to God-Level Content" },
            { step: 2, action: "View video quota used/remaining" },
            { step: 3, action: "View voice quota used/remaining" },
            { step: 4, action: "Check reset date" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Generate AI video (Luma)",
          description: "Test video generation - lumaVideos table",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Go to Video Generation" },
            { step: 2, action: "Enter video prompt" },
            { step: 3, action: "Select aspect ratio" },
            { step: 4, action: "Submit generation" },
            { step: 5, action: "Wait for processing" },
            { step: 6, action: "View completed video" },
            { step: 7, action: "Verify in gallery" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create voice clone",
          description: "Test voice cloning - voiceClones table",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Go to Voice Clones" },
            { step: 2, action: "Click 'Create Clone'" },
            { step: 3, action: "Upload audio samples" },
            { step: 4, action: "Wait for processing" },
            { step: 5, action: "Test generated voice" },
            { step: 6, action: "Set as default (optional)" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create talking avatar (D-ID)",
          description: "Test avatar videos - didVideos table",
          difficulty: "hard",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Go to Avatar Videos" },
            { step: 2, action: "Select avatar or upload image" },
            { step: 3, action: "Enter script text" },
            { step: 4, action: "Select voice" },
            { step: 5, action: "Generate video" },
            { step: 6, action: "View result" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: SOCIAL MEDIA MANAGEMENT (5 tables)
  // ===========================================

  getSocialMediaDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Social Media Management',
      priority: 'P2-MEDIUM',
      tablesCovered: ['socialPosts', 'platformConnections', 'socialSchedules', 'socialAnalytics', 'socialTemplates'],
      scenarios: [
        {
          title: "Connect social platform",
          description: "Test platform connection - platformConnections table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Go to Social Media Management" },
            { step: 2, action: "Click 'Connect Platform'" },
            { step: 3, action: "Select platform (Facebook/Instagram)" },
            { step: 4, action: "Authenticate" },
            { step: 5, action: "Verify connected" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Schedule social post",
          description: "Test post scheduling - socialPosts table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Create new post" },
            { step: 2, action: "Write content" },
            { step: 3, action: "Select platforms" },
            { step: 4, action: "Set schedule time" },
            { step: 5, action: "Schedule post" },
            { step: 6, action: "Verify in queue" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View social analytics",
          description: "Test engagement tracking - socialAnalytics table",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Go to Social Analytics" },
            { step: 2, action: "View engagement by platform" },
            { step: 3, action: "Check post performance" },
            { step: 4, action: "View trending content" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: MEMORIES (5 tables)
  // ===========================================

  getMemoriesDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Memories System',
      priority: 'P1-HIGH',
      tablesCovered: ['memories', 'memoryMedia', 'memoryTags', 'memoryShares', 'memoryCollections'],
      scenarios: [
        {
          title: "Create memory",
          description: "Test memory creation - memories table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to Memories" },
            { step: 2, action: "Click 'Create Memory'" },
            { step: 3, action: "Add title" },
            { step: 4, action: "Upload photos/videos" },
            { step: 5, action: "Add description" },
            { step: 6, action: "Tag location" },
            { step: 7, action: "Tag people" },
            { step: 8, action: "Save memory" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Browse memory timeline",
          description: "Test memory display",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to Memories" },
            { step: 2, action: "View timeline" },
            { step: 3, action: "Filter by date" },
            { step: 4, action: "Filter by event/trip" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create memory collection",
          description: "Test collections - memoryCollections table",
          difficulty: "medium",
          estimatedMinutes: 6,
          steps: [
            { step: 1, action: "Go to Collections" },
            { step: 2, action: "Create new collection" },
            { step: 3, action: "Name collection" },
            { step: 4, action: "Add memories to collection" },
            { step: 5, action: "Save" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Share memory",
          description: "Test memory sharing - memoryShares table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Open a memory" },
            { step: 2, action: "Click Share" },
            { step: 3, action: "Select recipients" },
            { step: 4, action: "Send share" },
            { step: 5, action: "Verify notification sent" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: MR. BLUE AI (8 tables)
  // ===========================================

  getMrBlueDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Mr. Blue AI',
      priority: 'P1-HIGH',
      tablesCovered: ['mrBlueConversations', 'mrBlueMessages', 'mrBlueContexts', 'mrBlueMemory',
                      'mrBlueAgentTasks', 'mrBlueAutonomousActions', 'mrBlueKnowledgeBase', 'mrBluePersonality'],
      scenarios: [
        {
          title: "Start Mr. Blue conversation",
          description: "Test AI chat - mrBlueConversations table",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Open Mr. Blue" },
            { step: 2, action: "Start new conversation" },
            { step: 3, action: "Type question about tango" },
            { step: 4, action: "Receive AI response" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Test Mr. Blue memory",
          description: "Test context retention - mrBlueMemory table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Tell Mr. Blue something personal" },
            { step: 2, action: "Continue conversation" },
            { step: 3, action: "Reference earlier information" },
            { step: 4, action: "Verify AI remembers context" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Request Mr. Blue action",
          description: "Test autonomous actions - mrBlueAgentTasks table",
          difficulty: "hard",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Ask Mr. Blue to do something" },
            { step: 2, action: "E.g., 'Find milongas in Buenos Aires'" },
            { step: 3, action: "Watch AI perform task" },
            { step: 4, action: "Review results" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View conversation history",
          description: "Test message history",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Open Mr. Blue" },
            { step: 2, action: "View past conversations" },
            { step: 3, action: "Continue old conversation" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  // ===========================================
  // PART 4: H2AC VOLUNTEER FRAMEWORK (4 tables)
  // ===========================================

  getH2ACDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'H2AC Volunteer Framework',
      priority: 'P1-HIGH',
      tablesCovered: ['h2acVolunteers', 'h2acTasks', 'h2acContributions', 'h2acRewards'],
      scenarios: [
        {
          title: "Register as H2AC volunteer",
          description: "Test volunteer registration - h2acVolunteers table",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to H2AC Program" },
            { step: 2, action: "Click 'Join as Volunteer'" },
            { step: 3, action: "Fill out profile" },
            { step: 4, action: "Select skills" },
            { step: 5, action: "Set availability" },
            { step: 6, action: "Submit application" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Complete volunteer task",
          description: "Test task completion - h2acContributions table",
          difficulty: "medium",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "View available tasks" },
            { step: 2, action: "Accept a task" },
            { step: 3, action: "Complete the work" },
            { step: 4, action: "Submit completion" },
            { step: 5, action: "Verify contribution logged" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View volunteer rewards",
          description: "Test rewards system - h2acRewards table",
          difficulty: "easy",
          estimatedMinutes: 4,
          steps: [
            { step: 1, action: "Go to Volunteer Dashboard" },
            { step: 2, action: "View earned rewards" },
            { step: 3, action: "Check XP balance" },
            { step: 4, action: "View badges earned" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View volunteer leaderboard",
          description: "Test volunteer rankings",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Navigate to Leaderboard" },
            { step: 2, action: "View top volunteers" },
            { step: 3, action: "Find your ranking" },
            { step: 4, action: "Filter by time period" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  /**
   * Get coverage statistics
   */
  getCoverageStats(): { totalDomains: number; totalScenarios: number; totalTables: number; byPriority: Record<string, number> } {
    const domains = this.getAllDomains();
    const allTables = new Set<string>();
    let totalScenarios = 0;
    const byPriority: Record<string, number> = {
      'P0-CRITICAL': 0,
      'P1-HIGH': 0,
      'P2-MEDIUM': 0,
      'P3-LOW': 0
    };

    for (const domain of domains) {
      totalScenarios += domain.scenarios.length;
      byPriority[domain.priority] = (byPriority[domain.priority] || 0) + domain.scenarios.length;
      domain.tablesCovered.forEach(t => allTables.add(t));
    }

    return {
      totalDomains: domains.length,
      totalScenarios,
      totalTables: allTables.size,
      byPriority
    };
  }
}

export const scenarioGenerator = new ScenarioGenerator();
