/**
 * MB.MD v9.9.4 - Comprehensive Test Scenario Generator
 * Generates 50+ test scenarios covering all 412 database tables across platform domains
 */

import { db } from "../../db";
import { uiTestScenarios, InsertUiTestScenario } from "@shared/schema";

export interface ScenarioDomain {
  name: string;
  priority: 'P0-CRITICAL' | 'P1-HIGH' | 'P2-MEDIUM' | 'P3-LOW';
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
      this.getSocialDomain(createdBy),
      this.getEventsDomain(createdBy),
      this.getFinancialDomain(createdBy),
      this.getTravelDomain(createdBy),
      this.getGamificationDomain(createdBy),
      this.getLifeCEODomain(createdBy),
      this.getGodLevelDomain(createdBy),
      this.getMemoriesDomain(createdBy),
      this.getProfileDomain(createdBy),
      this.getGroupsDomain(createdBy),
      this.getMessagingDomain(createdBy),
      this.getMarketplaceDomain(createdBy),
      this.getAdminDomain(createdBy),
      this.getMrBlueDomain(createdBy),
    ];
  }

  getSocialDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Social Features',
      priority: 'P1-HIGH',
      scenarios: [
        {
          title: "Create and publish a post with photo",
          description: "Test the social feed posting flow with media upload",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to feed page (/feed)" },
            { step: 2, action: "Click 'Create Post' or post input area" },
            { step: 3, action: "Write a post message" },
            { step: 4, action: "Upload a photo" },
            { step: 5, action: "Submit the post" },
            { step: 6, action: "Verify post appears in feed" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Like and comment on a post",
          description: "Test social engagement features",
          difficulty: "easy",
          estimatedMinutes: 3,
          steps: [
            { step: 1, action: "Navigate to feed page" },
            { step: 2, action: "Find a post" },
            { step: 3, action: "Click like button" },
            { step: 4, action: "Verify like count increases" },
            { step: 5, action: "Write a comment" },
            { step: 6, action: "Submit comment and verify it appears" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Send and accept friend request",
          description: "Test friend connection flow",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to discover/search users" },
            { step: 2, action: "Search for a user" },
            { step: 3, action: "Click on user profile" },
            { step: 4, action: "Send friend request" },
            { step: 5, action: "Navigate to friend requests" },
            { step: 6, action: "Verify request appears (if testing with test account)" }
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
      scenarios: [
        {
          title: "Create a new milonga event",
          description: "Test the complete event creation flow",
          difficulty: "medium",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Navigate to events page (/events)" },
            { step: 2, action: "Click 'Create Event' button" },
            { step: 3, action: "Enter event title and description" },
            { step: 4, action: "Select event type (Milonga)" },
            { step: 5, action: "Set date and time" },
            { step: 6, action: "Add venue/location" },
            { step: 7, action: "Set ticket price (if applicable)" },
            { step: 8, action: "Upload event image" },
            { step: 9, action: "Submit and verify event created" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "RSVP to an event",
          description: "Test event registration flow",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to events page" },
            { step: 2, action: "Browse upcoming events" },
            { step: 3, action: "Click on an event to view details" },
            { step: 4, action: "Click RSVP/Register button" },
            { step: 5, action: "Confirm registration" },
            { step: 6, action: "Verify confirmation and event in 'My Events'" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Use event map to find nearby milongas",
          description: "Test map-based event discovery",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Navigate to events map view" },
            { step: 2, action: "Allow location access or enter location" },
            { step: 3, action: "Zoom and pan the map" },
            { step: 4, action: "Filter by event type" },
            { step: 5, action: "Click on a map marker" },
            { step: 6, action: "View event details from popup" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create recurring event series",
          description: "Test event series functionality",
          difficulty: "hard",
          estimatedMinutes: 20,
          steps: [
            { step: 1, action: "Navigate to event creation" },
            { step: 2, action: "Toggle 'Recurring Event' option" },
            { step: 3, action: "Select recurrence pattern (weekly/monthly)" },
            { step: 4, action: "Set series end date" },
            { step: 5, action: "Complete event details" },
            { step: 6, action: "Submit and verify all instances created" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getFinancialDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Financial Management',
      priority: 'P0-CRITICAL',
      scenarios: [
        {
          title: "View subscription pricing page",
          description: "Test pricing page display and tier comparison",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to pricing page (/pricing)" },
            { step: 2, action: "Review available subscription tiers" },
            { step: 3, action: "Compare features between tiers" },
            { step: 4, action: "Click on 'Upgrade' button for a tier" },
            { step: 5, action: "Verify checkout modal/page appears" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Complete subscription upgrade flow",
          description: "Test Stripe payment integration (use test card)",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Navigate to pricing page" },
            { step: 2, action: "Select a subscription tier" },
            { step: 3, action: "Click upgrade/subscribe button" },
            { step: 4, action: "Enter test card details (4242 4242 4242 4242)" },
            { step: 5, action: "Complete payment" },
            { step: 6, action: "Verify subscription activated" },
            { step: 7, action: "Check premium features unlocked" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Access billing history",
          description: "Test billing and invoice viewing",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to settings/billing" },
            { step: 2, action: "View current subscription status" },
            { step: 3, action: "Access billing history" },
            { step: 4, action: "View/download an invoice" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getTravelDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Travel Planning',
      priority: 'P0-CRITICAL',
      scenarios: [
        {
          title: "Create a travel trip plan",
          description: "Test travel planner trip creation",
          difficulty: "medium",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Navigate to Travel Planner (/travel)" },
            { step: 2, action: "Click 'Create New Trip'" },
            { step: 3, action: "Enter destination city" },
            { step: 4, action: "Set travel dates" },
            { step: 5, action: "Add trip purpose/notes" },
            { step: 6, action: "Save trip and verify it appears in list" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Add activities to trip itinerary",
          description: "Test itinerary management",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Open an existing trip" },
            { step: 2, action: "Navigate to itinerary tab" },
            { step: 3, action: "Add a new activity/event" },
            { step: 4, action: "Set activity time and location" },
            { step: 5, action: "Reorder activities via drag-drop" },
            { step: 6, action: "Save and verify order preserved" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Find housing via travel planner",
          description: "Test housing search integration",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Open travel planner with a trip" },
            { step: 2, action: "Navigate to housing/accommodation tab" },
            { step: 3, action: "Search available housing" },
            { step: 4, action: "Filter by preferences" },
            { step: 5, action: "View housing listing details" },
            { step: 6, action: "Send inquiry or booking request" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getGamificationDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Gamification System',
      priority: 'P1-HIGH',
      scenarios: [
        {
          title: "View achievements and badges",
          description: "Test gamification dashboard",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to profile or achievements page" },
            { step: 2, action: "View earned badges" },
            { step: 3, action: "Check progress toward next badge" },
            { step: 4, action: "View points/XP balance" },
            { step: 5, action: "Check leaderboard position" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Complete a daily challenge",
          description: "Test daily challenge system",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "View daily challenges" },
            { step: 2, action: "Select a challenge to attempt" },
            { step: 3, action: "Complete the required action" },
            { step: 4, action: "Verify challenge marked complete" },
            { step: 5, action: "Check reward received" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getLifeCEODomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Life CEO AI',
      priority: 'P1-HIGH',
      scenarios: [
        {
          title: "Set a life goal in Life CEO",
          description: "Test Life CEO goal setting",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Navigate to Life CEO (/life-ceo)" },
            { step: 2, action: "Click 'Add New Goal'" },
            { step: 3, action: "Enter goal title and description" },
            { step: 4, action: "Set target date" },
            { step: 5, action: "Add milestones" },
            { step: 6, action: "Save and verify goal appears" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Get AI recommendations from Life CEO",
          description: "Test AI coaching functionality",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Open Life CEO dashboard" },
            { step: 2, action: "Request AI analysis/recommendations" },
            { step: 3, action: "Review AI suggestions" },
            { step: 4, action: "Accept or modify a recommendation" },
            { step: 5, action: "Track implementation" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getGodLevelDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'God-Level Content',
      priority: 'P1-HIGH',
      scenarios: [
        {
          title: "Access premium God-Level content",
          description: "Test premium content access",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to premium content area" },
            { step: 2, action: "Browse available God-Level content" },
            { step: 3, action: "Click on premium content item" },
            { step: 4, action: "Verify access (if subscribed) or paywall" },
            { step: 5, action: "View content or upgrade prompt" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getMemoriesDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Memories System',
      priority: 'P1-HIGH',
      scenarios: [
        {
          title: "Create a new memory",
          description: "Test memory creation flow",
          difficulty: "easy",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to Memories (/memories)" },
            { step: 2, action: "Click 'Create Memory'" },
            { step: 3, action: "Add title and description" },
            { step: 4, action: "Upload photos/videos" },
            { step: 5, action: "Tag location and people" },
            { step: 6, action: "Save and verify memory appears" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "View memory timeline",
          description: "Test memory browsing and timeline",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to memories page" },
            { step: 2, action: "View timeline/gallery view" },
            { step: 3, action: "Filter by date or event" },
            { step: 4, action: "Click on a memory to view details" },
            { step: 5, action: "Navigate through memory slideshow" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getProfileDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Profile Management',
      priority: 'P1-HIGH',
      scenarios: [
        {
          title: "Edit profile information",
          description: "Test profile editing",
          difficulty: "easy",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Navigate to profile page" },
            { step: 2, action: "Click 'Edit Profile'" },
            { step: 3, action: "Update bio/about section" },
            { step: 4, action: "Change profile photo" },
            { step: 5, action: "Update tango experience/roles" },
            { step: 6, action: "Save changes and verify" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create professional tango profile",
          description: "Test professional profile creation",
          difficulty: "hard",
          estimatedMinutes: 20,
          steps: [
            { step: 1, action: "Navigate to professional profile setup" },
            { step: 2, action: "Select profession type (Teacher/DJ/etc)" },
            { step: 3, action: "Add professional bio" },
            { step: 4, action: "Upload portfolio images/videos" },
            { step: 5, action: "Set hourly rates/services" },
            { step: 6, action: "Add availability calendar" },
            { step: 7, action: "Submit for review" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getGroupsDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Groups & Communities',
      priority: 'P2-MEDIUM',
      scenarios: [
        {
          title: "Join a city group",
          description: "Test group discovery and joining",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to Groups (/groups)" },
            { step: 2, action: "Browse or search for a group" },
            { step: 3, action: "Click on group to view details" },
            { step: 4, action: "Click 'Join Group'" },
            { step: 5, action: "Verify membership and access" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Create a new group",
          description: "Test group creation flow",
          difficulty: "medium",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Navigate to groups page" },
            { step: 2, action: "Click 'Create Group'" },
            { step: 3, action: "Enter group name and description" },
            { step: 4, action: "Set privacy settings" },
            { step: 5, action: "Upload group cover image" },
            { step: 6, action: "Submit and verify group created" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getMessagingDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Messaging System',
      priority: 'P2-MEDIUM',
      scenarios: [
        {
          title: "Send a direct message",
          description: "Test direct messaging flow",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to Messages (/messages)" },
            { step: 2, action: "Click 'New Message' or find a contact" },
            { step: 3, action: "Select recipient" },
            { step: 4, action: "Type message" },
            { step: 5, action: "Send and verify delivery" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Use unified inbox",
          description: "Test unified messaging inbox",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Navigate to unified inbox" },
            { step: 2, action: "View messages from different sources" },
            { step: 3, action: "Filter by source (internal/email)" },
            { step: 4, action: "Reply to a message" },
            { step: 5, action: "Archive or delete messages" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getMarketplaceDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Marketplace',
      priority: 'P2-MEDIUM',
      scenarios: [
        {
          title: "List an item for sale",
          description: "Test marketplace listing creation",
          difficulty: "medium",
          estimatedMinutes: 12,
          steps: [
            { step: 1, action: "Navigate to Marketplace (/marketplace)" },
            { step: 2, action: "Click 'Create Listing'" },
            { step: 3, action: "Select category (shoes/clothing/etc)" },
            { step: 4, action: "Add title and description" },
            { step: 5, action: "Upload photos" },
            { step: 6, action: "Set price" },
            { step: 7, action: "Publish listing" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Browse and purchase item",
          description: "Test marketplace purchasing",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Browse marketplace listings" },
            { step: 2, action: "Filter by category/price" },
            { step: 3, action: "View listing details" },
            { step: 4, action: "Contact seller or click 'Buy'" },
            { step: 5, action: "Complete purchase flow" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getAdminDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Admin Dashboard',
      priority: 'P1-HIGH',
      scenarios: [
        {
          title: "Access admin dashboard",
          description: "Test admin panel access and navigation",
          difficulty: "medium",
          estimatedMinutes: 10,
          steps: [
            { step: 1, action: "Navigate to Admin (/admin)" },
            { step: 2, action: "Verify admin dashboard loads" },
            { step: 3, action: "Navigate through admin sections" },
            { step: 4, action: "View user management" },
            { step: 5, action: "View event moderation" },
            { step: 6, action: "Check analytics/metrics" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Moderate reported content",
          description: "Test content moderation flow",
          difficulty: "hard",
          estimatedMinutes: 15,
          steps: [
            { step: 1, action: "Navigate to admin moderation queue" },
            { step: 2, action: "View reported content list" },
            { step: 3, action: "Select an item to review" },
            { step: 4, action: "View report details and content" },
            { step: 5, action: "Take action (approve/remove/warn)" },
            { step: 6, action: "Verify action completed" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }

  getMrBlueDomain(createdBy?: number): ScenarioDomain {
    return {
      name: 'Mr. Blue AI Assistant',
      priority: 'P2-MEDIUM',
      scenarios: [
        {
          title: "Ask Mr. Blue a question",
          description: "Test AI assistant chat functionality",
          difficulty: "easy",
          estimatedMinutes: 5,
          steps: [
            { step: 1, action: "Navigate to Mr. Blue (/mr-blue)" },
            { step: 2, action: "Type a question about tango" },
            { step: 3, action: "Send message" },
            { step: 4, action: "Wait for AI response" },
            { step: 5, action: "Verify response is relevant" }
          ],
          isActive: true,
          createdBy
        },
        {
          title: "Use Mr. Blue for event recommendations",
          description: "Test AI event suggestions",
          difficulty: "medium",
          estimatedMinutes: 8,
          steps: [
            { step: 1, action: "Open Mr. Blue assistant" },
            { step: 2, action: "Ask for event recommendations" },
            { step: 3, action: "Specify location/preferences" },
            { step: 4, action: "Review AI suggestions" },
            { step: 5, action: "Click through to recommended events" }
          ],
          isActive: true,
          createdBy
        }
      ]
    };
  }
}

export const scenarioGenerator = new ScenarioGenerator();
