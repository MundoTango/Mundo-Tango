#!/usr/bin/env tsx
/**
 * Import Learning Patterns from AGENT_LEARNING_INDEX_COMPLETE.md
 * 
 * This script extracts the 3 core patterns (with 3,181 variations) from the
 * AGENT_LEARNING_INDEX_COMPLETE.md file and imports them into the
 * learningPatterns database table.
 * 
 * Core Patterns:
 * 1. Cross-Surface Synchronization (~2,300 variations)
 * 2. Optimistic Update Preservation (~795 variations)
 * 3. Segment-Aware Query Matching (~80 variations)
 * 
 * Usage:
 *   tsx server/scripts/importLearningPatterns.ts
 */

import { db } from "../../shared/db";
import { learningPatterns, type InsertLearningPattern } from "../../shared/schema";
import { eq } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// PATTERN DATA - Extracted from AGENT_LEARNING_INDEX_COMPLETE.md
// ============================================================================

const PATTERNS: InsertLearningPattern[] = [
  // ==========================================================================
  // PATTERN 1: Cross-Surface Synchronization
  // ==========================================================================
  {
    patternName: "cross-surface-synchronization",
    category: "performance",
    problemSignature: `When data changes in one part of the UI (e.g., News Feed), other surfaces (e.g., Profile, Groups) don't reflect the update, causing data inconsistency across the platform.

SYMPTOMS:
- User likes a post on News Feed ✓
- Like count updates on News Feed ✓
- User navigates to Profile → old like count shown ✗
- User navigates to Group page → old like count shown ✗
- Bug reports: "Likes disappearing when I change pages"

ROOT CAUSE:
Query invalidation is too narrow - only invalidates the single post query, not all surfaces displaying that post.`,

    solutionTemplate: `// Universal invalidation helper
const invalidateEntityQueries = (
  entityType: 'events' | 'posts' | 'groups' | 'users' | 'comments',
  entityId?: number
) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey as string[];
      const keyString = Array.isArray(key) ? key.join('/') : String(key);

      // Match all queries containing this entity
      return keyString.includes(\`/api/\${entityType}\`) ||
             (entityId && keyString.includes(\`/api/\${entityType}/\${entityId}\`)) ||
             (query.state.data as any)?.entityId === entityId ||
             (query.state.data as any)?.entityType === entityType;
    }
  });
};

// Usage in mutation hooks
export const usePostLike = (postId: number) => {
  return useMutation({
    mutationFn: async () => {
      return apiRequest('POST', \`/api/posts/\${postId}/like\`);
    },
    onSuccess: () => {
      // ✅ CORRECT: Invalidates ALL surfaces showing this post
      invalidateEntityQueries('posts', postId);
    }
  });
};`,

    discoveredBy: ["Infrastructure Agents", "Layer 7 Agent", "Layer 14 Agent", "Layer 22 Agent"],
    timesApplied: 2300,
    successRate: 0.95,
    confidence: 0.93,
    
    codeExample: `// Before (WRONG - inconsistent UI)
export const usePostLike = (postId: number) => {
  return useMutation({
    mutationFn: async () => apiRequest('POST', \`/api/posts/\${postId}/like\`),
    onSuccess: () => {
      // ❌ Only invalidates single post
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
    }
  });
};

// After (CORRECT - synced everywhere)
export const usePostLike = (postId: number) => {
  return useMutation({
    mutationFn: async () => apiRequest('POST', \`/api/posts/\${postId}/like\`),
    onSuccess: () => {
      // ✅ Invalidates ALL surfaces
      invalidateEntityQueries('posts', postId);
    }
  });
};`,

    whenNotToUse: `DO NOT use broad invalidation when:
1. Performance is critical and you know EXACTLY which queries need updates
2. You're working with real-time data that updates via WebSocket (no need to invalidate)
3. The entity is not displayed on multiple surfaces
4. You're implementing pagination and only need to invalidate specific pages

EDGE CASES:
- If dealing with deeply nested data, consider more surgical invalidation
- For very high-frequency updates (>100/sec), use optimistic updates only
- If backend sends real-time updates, disable automatic invalidation`,

    metadata: {
      impactMetrics: {
        dataConsistency: "100%",
        surfaceSyncLatency: "<50ms",
        cacheHitRate: "85%+",
        userSatisfactionIncrease: "+31%"
      },
      appliedTo: [
        "News Feed posts",
        "Group content",
        "Profile updates",
        "Event RSVPs",
        "Friend requests",
        "Comment threads",
        "Notification badges",
        "Map markers"
      ],
      relatedFiles: [
        "client/src/hooks/usePostLike.ts",
        "client/src/hooks/useEventRSVP.ts",
        "client/src/hooks/useCommentMutation.ts",
        "client/src/hooks/useFriendRequest.ts",
        "client/src/hooks/useGroupJoin.ts",
        "client/src/hooks/usePostCreate.ts",
        "client/src/hooks/useEventCreate.ts",
        "client/src/hooks/useGroupCreate.ts"
      ]
    },

    variations: {
      postLikes: {
        file: "client/src/hooks/usePostLike.ts",
        instances: 100,
        entity: "posts"
      },
      eventRSVPs: {
        file: "client/src/hooks/useEventRSVP.ts",
        instances: 100,
        entity: "events"
      },
      comments: {
        file: "client/src/hooks/useCommentMutation.ts",
        instances: 100,
        entity: "comments"
      },
      friendRequests: {
        file: "client/src/hooks/useFriendRequest.ts",
        instances: 100,
        entity: "users"
      },
      groupActions: {
        file: "client/src/hooks/useGroupJoin.ts",
        instances: 100,
        entity: "groups"
      },
      createOperations: {
        files: [
          "client/src/hooks/useEventCreate.ts",
          "client/src/hooks/usePostCreate.ts",
          "client/src/hooks/useGroupCreate.ts"
        ],
        instances: 300,
        note: "Invalidates entire entity list on create"
      },
      updateOperations: {
        files: [
          "client/src/hooks/useEventUpdate.ts",
          "client/src/hooks/usePostUpdate.ts",
          "client/src/hooks/useGroupUpdate.ts",
          "client/src/hooks/useProfileUpdate.ts"
        ],
        instances: 400,
        note: "Invalidates specific entity + lists"
      },
      deleteOperations: {
        files: [
          "client/src/hooks/usePostDelete.ts",
          "client/src/hooks/useEventDelete.ts",
          "client/src/hooks/useCommentDelete.ts"
        ],
        instances: 300,
        note: "Invalidates entity + removes from all caches"
      },
      memoryOperations: {
        files: [
          "client/src/hooks/useMemoryCreate.ts",
          "client/src/hooks/useMemoryUpdate.ts",
          "client/src/hooks/useMemoryDelete.ts"
        ],
        instances: 200,
        entity: "memories"
      },
      mediaOperations: {
        files: [
          "client/src/hooks/useAvatarUpdate.ts",
          "client/src/hooks/useCoverPhotoUpdate.ts"
        ],
        instances: 100,
        entity: "users"
      },
      notificationOperations: {
        instances: 300,
        note: "Notification badge counts across all surfaces"
      },
      mapMarkerOperations: {
        instances: 300,
        note: "Event/user location markers on map"
      }
    }
  },

  // ==========================================================================
  // PATTERN 2: Optimistic Update Preservation
  // ==========================================================================
  {
    patternName: "optimistic-update-preservation",
    category: "optimization",
    problemSignature: `When invalidating queries after mutations, optimistic updates are lost because refetch overwrites the UI with stale server data, causing flickering and poor UX.

SYMPTOMS:
- User clicks like → UI shows 43 instantly ✓
- Server responds → refetch triggered ✓
- Server returns \`{ likesCount: 43 }\` but UI expects \`{ likes: 43 }\` ✗
- UI shows \`undefined\` for 50ms (flickering!) ✗
- User experience: Janky, unpolished

ROOT CAUSE:
Server uses different field names ('likesCount') than client optimistic updates ('likes'), and immediate refetch overwrites optimistic values before server data is mapped.`,

    solutionTemplate: `// Universal optimistic update preservation helper
const preserveOptimisticUpdate = <T extends Record<string, any>>(
  old: T | undefined,
  optimisticFields: Array<keyof T>
): T | undefined => {
  if (!old) return old;

  const preserved: any = { ...old };

  optimisticFields.forEach(field => {
    // Preserve optimistic 'field' if exists, fallback to 'fieldCount' from server
    const optimisticKey = field;
    const serverKey = \`\${String(field)}Count\`;

    if (optimisticKey in preserved && serverKey in preserved) {
      preserved[field] = preserved[optimisticKey] ?? preserved[serverKey];
    }
  });

  return preserved;
};

// Usage in mutation hooks
export const usePostLike = (postId: number) => {
  return useMutation({
    mutationFn: async () => apiRequest('POST', \`/api/posts/\${postId}/like\`),
    onMutate: async () => {
      queryClient.setQueryData(['/api/posts', postId], (old: Post | undefined) => {
        if (!old) return old;
        return {
          ...old,
          likes: (old.likes ?? old.likesCount ?? 0) + 1,
          isLiked: true
        };
      });
    },
    onSettled: () => {
      // Preserve optimistic values during refetch
      queryClient.setQueryData(['/api/posts', postId], (old: Post | undefined) => {
        return preserveOptimisticUpdate(old, ['likes', 'comments', 'shares']);
      });
    }
  });
};`,

    discoveredBy: ["Frontend Agents", "Layer 7 Agent", "Layer 14 Agent"],
    timesApplied: 795,
    successRate: 0.95,
    confidence: 0.94,

    codeExample: `// Before (WRONG - UI flickering)
export const usePostLike = (postId: number) => {
  return useMutation({
    mutationFn: async () => apiRequest('POST', \`/api/posts/\${postId}/like\`),
    onMutate: async () => {
      queryClient.setQueryData(['/api/posts', postId], (old: Post) => ({
        ...old,
        likes: old.likes + 1  // Optimistic
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
      // ❌ Refetch returns 'likesCount', UI shows undefined briefly
    }
  });
};

// After (CORRECT - smooth experience)
export const usePostLike = (postId: number) => {
  return useMutation({
    mutationFn: async () => apiRequest('POST', \`/api/posts/\${postId}/like\`),
    onMutate: async () => {
      queryClient.setQueryData(['/api/posts', postId], (old: Post) => ({
        ...old,
        likes: (old.likes ?? old.likesCount ?? 0) + 1
      }));
    },
    onSettled: () => {
      queryClient.setQueryData(['/api/posts', postId], (old: Post) => ({
        ...old,
        likes: old.likes ?? old.likesCount  // ✅ Nullish coalescing
      }));
    }
  });
};`,

    whenNotToUse: `DO NOT use optimistic preservation when:
1. Server response structure EXACTLY matches client expectations (no field name mismatches)
2. You want to force a "fresh from server" state (e.g., after critical data update)
3. Real-time updates from WebSocket already handle the sync
4. The mutation is not time-sensitive (e.g., background sync)

EDGE CASES:
- If server can reject optimistic values (validation), add onError rollback
- For bulk operations, preserve arrays carefully (check indices)
- If using TypeScript strict mode, ensure field types match`,

    metadata: {
      impactMetrics: {
        flickeringEliminated: "100%",
        uiConsistency: "maintained",
        perceivedLatency: "<50ms",
        userSatisfaction: "seamless experience"
      },
      appliedTo: [
        "Post likes",
        "Comment counts",
        "Event RSVPs",
        "Friend requests",
        "Group memberships",
        "Notification badges",
        "Share counts",
        "Reaction counts"
      ],
      relatedFiles: [
        "client/src/hooks/usePostLike.ts",
        "client/src/hooks/useCommentMutation.ts",
        "client/src/hooks/useEventRSVP.ts",
        "client/src/hooks/useGroupJoin.ts",
        "client/src/hooks/useFriendRequest.ts",
        "client/src/hooks/useReaction.ts",
        "client/src/hooks/useShare.ts"
      ]
    },

    variations: {
      postInteractions: {
        files: [
          "client/src/hooks/usePostLike.ts",
          "client/src/hooks/usePostShare.ts",
          "client/src/hooks/useReaction.ts"
        ],
        instances: 300,
        preservedFields: ["likes", "shares", "reactions"]
      },
      commentOperations: {
        file: "client/src/hooks/useCommentMutation.ts",
        instances: 100,
        preservedFields: ["comments"]
      },
      eventOperations: {
        file: "client/src/hooks/useEventRSVP.ts",
        instances: 100,
        preservedFields: ["attendeeCount", "isAttending"]
      },
      friendshipOperations: {
        file: "client/src/hooks/useFriendRequest.ts",
        instances: 100,
        preservedFields: ["friendsCount", "isFriend", "requestStatus"]
      },
      groupOperations: {
        file: "client/src/hooks/useGroupJoin.ts",
        instances: 95,
        preservedFields: ["memberCount", "isMember"]
      },
      notificationBadges: {
        instances: 100,
        preservedFields: ["unreadCount", "notificationCount"]
      }
    }
  },

  // ==========================================================================
  // PATTERN 3: Segment-Aware Query Matching
  // ==========================================================================
  {
    patternName: "segment-aware-query-matching",
    category: "performance",
    problemSignature: `Query key invalidation is too broad, causing unrelated queries to refetch unnecessarily. Simple string matching like queryKey.includes('/api/events') matches both '/api/events' and '/api/achievements', leading to over-invalidation.

SYMPTOMS:
- User RSVPs to "Tango Night" event ✓
- Query invalidator runs ✓
- Matches: \`/api/events\`, \`/api/events/123\`, \`/api/users/5/events\` ✓
- Also matches: \`/api/achievements\` (contains 'events'!) ✗
- Refetches user achievements unnecessarily ✗
- 2x slower response time ✗

ROOT CAUSE:
Simple string.includes() matching is too greedy - it matches substrings instead of exact path segments.`,

    solutionTemplate: `// Segment-aware matcher with word boundaries
const segmentMatcher = (queryKey: unknown[], segment: string): boolean => {
  const key = Array.isArray(queryKey) ? queryKey.join('/') : String(queryKey);
  const pattern = new RegExp(\`\\\\b\${segment}\\\\b\`);
  return pattern.test(key);
};

// Usage in mutation hooks
export const useEventRSVP = (eventId: number) => {
  return useMutation({
    mutationFn: async (attending: boolean) => {
      return apiRequest('POST', \`/api/events/\${eventId}/rsvp\`, { attending });
    },
    onSuccess: () => {
      // ✅ CORRECT: Word boundary regex - only exact 'events' segment
      queryClient.invalidateQueries({
        predicate: (query) => segmentMatcher(query.queryKey as string[], '/api/events')
      });
      
      // Matches: /api/events, /api/events/123
      // Does NOT match: /api/achievements, /api/preventing
    }
  });
};`,

    discoveredBy: ["Infrastructure Agents", "Layer 7 Agent"],
    timesApplied: 80,
    successRate: 0.95,
    confidence: 0.95,

    codeExample: `// Before (WRONG - over-invalidation)
export const useEventRSVP = (eventId: number) => {
  return useMutation({
    mutationFn: async (attending: boolean) => {
      return apiRequest('POST', \`/api/events/\${eventId}/rsvp\`, { attending });
    },
    onSuccess: () => {
      // ❌ WRONG: Too broad
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey.join('/');
          return key.includes('events');  // Matches 'achievements' too!
        }
      });
    }
  });
};

// After (CORRECT - precise matching)
export const useEventRSVP = (eventId: number) => {
  return useMutation({
    mutationFn: async (attending: boolean) => {
      return apiRequest('POST', \`/api/events/\${eventId}/rsvp\`, { attending });
    },
    onSuccess: () => {
      // ✅ CORRECT: Word boundary regex
      queryClient.invalidateQueries({
        predicate: (query) => segmentMatcher(query.queryKey as string[], '/api/events')
      });
    }
  });
};`,

    whenNotToUse: `DO NOT use segment-aware matching when:
1. You intentionally want to invalidate related paths (e.g., '/api/user-events' when '/api/events' changes)
2. Your query keys use non-standard delimiters (not '/')
3. Performance of regex is a concern (use exact string matching instead)
4. You're already using queryKey arrays with exact matching

EDGE CASES:
- If query keys contain special regex characters, escape them
- For case-insensitive matching, add 'i' flag to regex
- If using query key objects, convert to string first`,

    metadata: {
      impactMetrics: {
        latencyReduction: "90%",
        overInvalidationEliminated: "100%",
        perceivedLatency: "<50ms",
        cacheEfficiency: "+60%"
      },
      appliedTo: [
        "Event queries",
        "Post queries",
        "Group queries",
        "User profile queries",
        "Comment queries"
      ],
      relatedFiles: [
        "client/src/hooks/useEventRSVP.ts",
        "client/src/hooks/usePostLike.ts",
        "client/src/hooks/useCommentMutation.ts",
        "client/src/hooks/useFriendRequest.ts",
        "client/src/lib/queryUtils.ts"
      ]
    },

    variations: {
      eventQueries: {
        file: "client/src/hooks/useEventRSVP.ts",
        instances: 20,
        segment: "/api/events"
      },
      postQueries: {
        file: "client/src/hooks/usePostLike.ts",
        instances: 20,
        segment: "/api/posts"
      },
      groupQueries: {
        file: "client/src/hooks/useGroupJoin.ts",
        instances: 15,
        segment: "/api/groups"
      },
      userQueries: {
        file: "client/src/hooks/useFriendRequest.ts",
        instances: 15,
        segment: "/api/users"
      },
      commentQueries: {
        file: "client/src/hooks/useCommentMutation.ts",
        instances: 10,
        segment: "/api/comments"
      }
    }
  }
];

// ============================================================================
// IMPORT LOGIC
// ============================================================================

async function main() {
  console.log('🚀 Starting Learning Patterns Import...\n');
  console.log(`📊 Total patterns to import: ${PATTERNS.length}`);
  console.log(`📈 Total variations/applications: ${PATTERNS.reduce((sum, p) => sum + p.timesApplied, 0)}\n`);

  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const pattern of PATTERNS) {
    try {
      console.log(`\n📝 Processing: ${pattern.patternName}`);
      console.log(`   Category: ${pattern.category}`);
      console.log(`   Discovered by: ${pattern.discoveredBy.join(', ')}`);
      console.log(`   Applications: ${pattern.timesApplied}`);
      console.log(`   Confidence: ${Math.round(pattern.confidence * 100)}%`);
      console.log(`   Success rate: ${Math.round(pattern.successRate * 100)}%`);

      // Check if pattern already exists
      const existing = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.patternName, pattern.patternName))
        .limit(1);

      if (existing.length > 0) {
        console.log(`   ℹ️  Pattern exists - updating...`);
        
        // Update existing pattern
        await db
          .update(learningPatterns)
          .set({
            problemSignature: pattern.problemSignature,
            solutionTemplate: pattern.solutionTemplate,
            category: pattern.category,
            discoveredBy: pattern.discoveredBy,
            timesApplied: pattern.timesApplied,
            successRate: pattern.successRate,
            confidence: pattern.confidence,
            metadata: pattern.metadata,
            variations: pattern.variations,
            whenNotToUse: pattern.whenNotToUse,
            codeExample: pattern.codeExample,
            isActive: true,
            updatedAt: new Date()
          })
          .where(eq(learningPatterns.id, existing[0].id));

        console.log(`   ✅ Updated successfully`);
        updatedCount++;
      } else {
        console.log(`   ➕ New pattern - inserting...`);
        
        // Insert new pattern
        await db
          .insert(learningPatterns)
          .values({
            ...pattern,
            isActive: true
          });

        console.log(`   ✅ Inserted successfully`);
        insertedCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${pattern.patternName}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Inserted: ${insertedCount} patterns`);
  console.log(`🔄 Updated:  ${updatedCount} patterns`);
  console.log(`❌ Errors:   ${errorCount} patterns`);
  console.log(`📈 Total:    ${insertedCount + updatedCount} patterns in database\n`);

  // Verify searchability
  console.log('🔍 Verifying patterns are searchable...\n');

  for (const pattern of PATTERNS) {
    try {
      const found = await db
        .select()
        .from(learningPatterns)
        .where(eq(learningPatterns.patternName, pattern.patternName))
        .limit(1);

      if (found.length > 0) {
        console.log(`✅ ${pattern.patternName}: Searchable`);
        console.log(`   ID: ${found[0].id}, Applications: ${found[0].timesApplied}, Success: ${Math.round(found[0].successRate * 100)}%`);
      } else {
        console.log(`❌ ${pattern.patternName}: NOT FOUND`);
      }
    } catch (error) {
      console.error(`❌ Error verifying ${pattern.patternName}:`, error);
    }
  }

  console.log('\n✅ Import complete!\n');
  process.exit(0);
}

// Run the import
main().catch((error) => {
  console.error('❌ Fatal error during import:', error);
  process.exit(1);
});
