import { db } from "@shared/db";
import { groups } from "@shared/schema";
import { inArray } from "drizzle-orm";

/**
 * Enriches post content by adding group type information to @group mentions
 * Converts old format: @group:group_1:Name
 * To new format: @group:professional:group_1:Name or @group:city:group_1:Name
 */
export async function enrichPostContentWithGroupTypes(content: string): Promise<string> {
  if (!content || !content.includes('@group:')) {
    return content;
  }

  // Find all @group mentions in old format (without group type)
  const oldFormatRegex = /@group:(?!(?:professional|city):)(group_\d+):([^@]*?)(?=\s*(?:@|$))/g;
  const matches = Array.from(content.matchAll(oldFormatRegex));
  
  console.log('[ENRICH] Checking content:', content.substring(0, 200));
  console.log('[ENRICH] Found matches:', matches.length);
  
  if (matches.length === 0) {
    return content; // Already in new format or no groups
  }

  // Extract unique group IDs
  const groupIds = Array.from(new Set(matches.map(m => {
    const fullId = m[1]; // e.g., "group_1"
    return parseInt(fullId.split('_')[1]); // Extract numeric ID
  })));

  // Fetch group types from database
  const groupData = await db
    .select({ id: groups.id, type: groups.type })
    .from(groups)
    .where(inArray(groups.id, groupIds));

  // Create a map of group_id -> type
  const groupTypeMap = new Map(
    groupData.map(g => [`group_${g.id}`, g.type || 'city'])
  );

  // Replace old format with new format
  let enrichedContent = content;
  for (const match of matches) {
    const [fullMatch, groupId, name] = match;
    const groupType = groupTypeMap.get(groupId) || 'city';
    const newFormat = `@group:${groupType}:${groupId}:${name}`;
    console.log(`[ENRICH] Converting: ${fullMatch} -> ${newFormat}`);
    enrichedContent = enrichedContent.replace(fullMatch, newFormat);
  }

  console.log('[ENRICH] Result:', enrichedContent.substring(0, 200));
  return enrichedContent;
}
