/**
 * MB.MD Participant Extraction Service
 * 
 * Extracts participant roles (organizers, DJs, teachers, performers) from
 * scraped event descriptions and matches them against existing user profiles.
 * 
 * Protocol: Replit AI → Mr. Blue → AGENT_EXTRACT_1
 */

import { db } from '@shared/db';
import { users, scrapedProfiles } from '@shared/schema';
import { sql, ilike, or } from 'drizzle-orm';

export interface ExtractedParticipant {
  name: string;
  role: 'organizer' | 'co_organizer' | 'dj' | 'teacher' | 'performer' | 'photographer' | 'host';
  sourceText: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  matchedUserId?: number;
  matchedProfileId?: number;
  confidence: number;
}

export interface ExtractionResult {
  organizerText: string | null;
  djText: string | null;
  teacherText: string | null;
  performerText: string | null;
  participants: ExtractedParticipant[];
  extractedMetadata: {
    musicStyle?: string;
    dressCode?: string;
    skillLevel?: string;
  };
}

const ORGANIZER_PATTERNS = [
  /(?:organised|organized|hosted|presented|brought to you) by[:\s]+([^.|\n]+)/gi,
  /(?:organiser|organizer|host)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:run by|created by)[:\s]+([^.|\n]+)/gi,
];

const CO_ORGANIZER_PATTERNS = [
  /(?:co-organis(?:er|ed)|co-host(?:ed)?)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:in collaboration with|together with|partnered with)[:\s]+([^.|\n]+)/gi,
  /(?:and|&)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:present|host|bring)/gi,
];

const DJ_PATTERNS = [
  /(?:dj|d\.j\.)[:\s]+([^.|\n]+)/gi,
  /(?:music by|tunes by|tandas by|played by)[:\s]+([^.|\n]+)/gi,
  /(?:spinning|playing)[:\s]+([^.|\n]+)/gi,
  /(?:dj set by|set by)[:\s]+([^.|\n]+)/gi,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:on the decks|spinning)/gi,
];

const TEACHER_PATTERNS = [
  /(?:taught by|instruction by|class(?:es)? (?:with|by))[:\s]+([^.|\n]+)/gi,
  /(?:teacher|instructor|maestro|maestra)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:lesson|workshop|class) with[:\s]+([^.|\n]+)/gi,
  /(?:teaching)[:\s]+([^.|\n]+)/gi,
  /([A-Z][a-z]+(?:\s+(?:&|and)\s+[A-Z][a-z]+)?)\s+(?:teach(?:es|ing)?|instruct)/gi,
];

const PERFORMER_PATTERNS = [
  /(?:performance by|performing|exhibition by|show by)[:\s]+([^.|\n]+)/gi,
  /(?:performer|artist|guest artist)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:special guest|featuring|feat\.?)[:\s]+([^.|\n]+)/gi,
  /(?:live performance|demo) by[:\s]+([^.|\n]+)/gi,
];

const MUSIC_STYLE_PATTERNS = [
  { pattern: /traditional\s*tango/gi, style: 'traditional' },
  { pattern: /(?:neo|nuevo)\s*tango/gi, style: 'neo' },
  { pattern: /alternative\s*(?:tango|music)/gi, style: 'alternative' },
  { pattern: /golden\s*age/gi, style: 'traditional' },
  { pattern: /vals|waltz/gi, style: 'vals' },
  { pattern: /milonga\s*music/gi, style: 'milonga' },
  { pattern: /electrotango|electronic\s*tango/gi, style: 'electronic' },
];

const DRESS_CODE_PATTERNS = [
  { pattern: /formal\s*(?:dress|attire)/gi, code: 'formal' },
  { pattern: /elegant|dressy/gi, code: 'elegant' },
  { pattern: /smart\s*casual/gi, code: 'smart_casual' },
  { pattern: /casual/gi, code: 'casual' },
  { pattern: /no\s*(?:jeans|sneakers)/gi, code: 'smart_casual' },
];

const SKILL_LEVEL_PATTERNS = [
  { pattern: /beginner(?:s)?(?:\s*only|\s*welcome)?/gi, level: 'beginner' },
  { pattern: /intermediate/gi, level: 'intermediate' },
  { pattern: /advanced/gi, level: 'advanced' },
  { pattern: /all\s*levels/gi, level: 'all_levels' },
  { pattern: /open\s*level/gi, level: 'all_levels' },
];

/**
 * Split comma/and-separated list of names into individual names
 */
function splitNameList(text: string): string[] {
  return text
    .split(/[,&]|\band\b/gi)
    .map(name => name.trim())
    .filter(name => name.length > 2 && name.length < 60)
    .filter(name => !name.match(/^\d+$/) && !name.includes('http'));
}

function extractNames(text: string, patterns: RegExp[]): string[] {
  const names: string[] = [];
  
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const extracted = match[1]?.trim();
      if (extracted && extracted.length > 2 && extracted.length < 200) {
        const cleaned = extracted
          .replace(/[!.,:;]+$/, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleaned) {
          // Split comma-separated names and add each individually
          const individualNames = splitNameList(cleaned);
          for (const name of individualNames) {
            if (!names.includes(name)) {
              names.push(name);
            }
          }
        }
      }
    }
  }
  
  return names;
}

function extractMetadata(text: string): { musicStyle?: string; dressCode?: string; skillLevel?: string } {
  const metadata: { musicStyle?: string; dressCode?: string; skillLevel?: string } = {};
  
  for (const { pattern, style } of MUSIC_STYLE_PATTERNS) {
    if (pattern.test(text)) {
      metadata.musicStyle = style;
      break;
    }
  }
  
  for (const { pattern, code } of DRESS_CODE_PATTERNS) {
    if (pattern.test(text)) {
      metadata.dressCode = code;
      break;
    }
  }
  
  for (const { pattern, level } of SKILL_LEVEL_PATTERNS) {
    if (pattern.test(text)) {
      metadata.skillLevel = level;
      break;
    }
  }
  
  return metadata;
}

async function matchUserProfile(name: string): Promise<{ userId?: number; profileId?: number; confidence: number }> {
  const nameLower = name.toLowerCase().trim();
  
  // Skip very short or invalid names
  if (nameLower.length < 3 || nameLower.includes('&nbsp')) {
    return { confidence: 0 };
  }
  
  const nameParts = nameLower.split(/\s+/).filter(p => p.length > 1);
  if (nameParts.length === 0) {
    return { confidence: 0 };
  }
  
  try {
    // Search by name, first_name, last_name
    const matchingUsers = await db.query.users.findMany({
      where: or(
        ilike(users.name, `%${nameLower}%`),
        ilike(users.firstName, `%${nameParts[0]}%`),
        nameParts.length > 1 ? ilike(users.lastName, `%${nameParts[nameParts.length - 1]}%`) : undefined
      ),
      limit: 5
    });
    
    for (const user of matchingUsers) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().trim();
      const userName = (user.name || '').toLowerCase();
      
      if (fullName === nameLower || userName === nameLower) {
        return { userId: user.id, confidence: 0.95 };
      }
      
      if (fullName.includes(nameLower) || nameLower.includes(fullName)) {
        return { userId: user.id, confidence: 0.75 };
      }
    }
    
    // Check scraped profiles
    const matchingProfiles = await db.query.scrapedProfiles.findMany({
      where: ilike(scrapedProfiles.name, `%${nameLower}%`),
      limit: 5
    });
    
    for (const profile of matchingProfiles) {
      const profileName = (profile.name || '').toLowerCase();
      if (profileName === nameLower) {
        return { 
          profileId: profile.id, 
          userId: profile.claimedBy || undefined,
          confidence: 0.85 
        };
      }
    }
  } catch (error) {
    // Skip on query errors (malformed names, etc.)
    console.error(`[MB.MD] Error matching user profile for "${name}":`, error);
  }
  
  return { confidence: 0 };
}

export async function extractParticipants(
  title: string,
  description: string | null,
  organizer: string | null
): Promise<ExtractionResult> {
  const fullText = `${title}\n${description || ''}\n${organizer || ''}`;
  const participants: ExtractedParticipant[] = [];
  
  const organizerNames = organizer 
    ? [organizer, ...extractNames(fullText, ORGANIZER_PATTERNS)]
    : extractNames(fullText, ORGANIZER_PATTERNS);
  
  const coOrganizerNames = extractNames(fullText, CO_ORGANIZER_PATTERNS);
  const djNames = extractNames(fullText, DJ_PATTERNS);
  const teacherNames = extractNames(fullText, TEACHER_PATTERNS);
  const performerNames = extractNames(fullText, PERFORMER_PATTERNS);
  
  for (const name of Array.from(new Set(organizerNames))) {
    const match = await matchUserProfile(name);
    participants.push({
      name,
      role: 'organizer',
      sourceText: organizer || 'Extracted from description',
      matchedUserId: match.userId,
      matchedProfileId: match.profileId,
      confidence: match.confidence
    });
  }
  
  for (const name of Array.from(new Set(coOrganizerNames))) {
    if (!organizerNames.includes(name)) {
      const match = await matchUserProfile(name);
      participants.push({
        name,
        role: 'co_organizer',
        sourceText: 'Extracted from description',
        matchedUserId: match.userId,
        matchedProfileId: match.profileId,
        confidence: match.confidence
      });
    }
  }
  
  for (const name of Array.from(new Set(djNames))) {
    const match = await matchUserProfile(name);
    participants.push({
      name,
      role: 'dj',
      sourceText: 'Extracted from description',
      matchedUserId: match.userId,
      matchedProfileId: match.profileId,
      confidence: match.confidence
    });
  }
  
  for (const name of Array.from(new Set(teacherNames))) {
    const match = await matchUserProfile(name);
    participants.push({
      name,
      role: 'teacher',
      sourceText: 'Extracted from description',
      matchedUserId: match.userId,
      matchedProfileId: match.profileId,
      confidence: match.confidence
    });
  }
  
  for (const name of Array.from(new Set(performerNames))) {
    const match = await matchUserProfile(name);
    participants.push({
      name,
      role: 'performer',
      sourceText: 'Extracted from description',
      matchedUserId: match.userId,
      matchedProfileId: match.profileId,
      confidence: match.confidence
    });
  }
  
  const extractedMetadata = extractMetadata(fullText);
  
  return {
    organizerText: organizerNames.length > 0 ? organizerNames.join(', ') : null,
    djText: djNames.length > 0 ? djNames.join(', ') : null,
    teacherText: teacherNames.length > 0 ? teacherNames.join(', ') : null,
    performerText: performerNames.length > 0 ? performerNames.join(', ') : null,
    participants,
    extractedMetadata
  };
}

export function extractSocialLinks(text: string): { facebook?: string; instagram?: string; website?: string } {
  const links: { facebook?: string; instagram?: string; website?: string } = {};
  
  const fbMatch = text.match(/(?:facebook\.com|fb\.com)\/([^\s"'<>]+)/i);
  if (fbMatch) {
    links.facebook = `https://facebook.com/${fbMatch[1]}`;
  }
  
  const igMatch = text.match(/(?:instagram\.com|instagr\.am)\/([^\s"'<>]+)/i);
  if (igMatch) {
    links.instagram = `https://instagram.com/${igMatch[1]}`;
  }
  
  const urlMatch = text.match(/https?:\/\/(?!(?:facebook|instagram|fb|instagr))[^\s"'<>]+/gi);
  if (urlMatch && urlMatch.length > 0) {
    links.website = urlMatch[0];
  }
  
  return links;
}

export async function createScrapedProfile(
  name: string,
  role: string,
  sourceId: number | null,
  socialLinks?: { facebook?: string; instagram?: string; website?: string }
): Promise<number> {
  const existing = await db.query.scrapedProfiles.findFirst({
    where: ilike(scrapedProfiles.name, name)
  });
  
  if (existing) {
    return existing.id;
  }
  
  const [profile] = await db.insert(scrapedProfiles).values({
    name,
    profileType: role,
    sourceId: sourceId,
    socialLinks: socialLinks || {},
    claimed: false
  }).returning();
  
  return profile.id;
}
