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
  // English
  /(?:organised|organized|presented|brought to you) by[:\s]+([^.|\n]+)/gi,
  /(?:organiser|organizer)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:run by|created by)[:\s]+([^.|\n]+)/gi,
  // Spanish
  /(?:organizado por|organizadores?)[:\s]+([^.|\n]+)/gi,
  /(?:presentado por)[:\s]+([^.|\n]+)/gi,
  // Italian
  /(?:organizzato da|organizzatori?)[:\s]+([^.|\n]+)/gi,
  // French
  /(?:organisé par|organisateurs?)[:\s]+([^.|\n]+)/gi,
  // German
  /(?:organisiert von|veranstaltet von)[:\s]+([^.|\n]+)/gi,
];

const HOST_PATTERNS = [
  // English
  /(?:hosted by|host)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:mc|m\.c\.|emcee)[:\s]+([^.|\n]+)/gi,
  /(?:master of ceremonies|presenter)[:\s]+([^.|\n]+)/gi,
  /(?:your host|tonight's host)[:\s]+([^.|\n]+)/gi,
  // Spanish
  /(?:animación|animador|animadora)[:\s]+([^.|\n]+)/gi,
  /(?:presentador|presentadora)[:\s]+([^.|\n]+)/gi,
  /(?:conducción|conduce)[:\s]+([^.|\n]+)/gi,
  // Italian
  /(?:condotto da|presentato da)[:\s]+([^.|\n]+)/gi,
  /(?:animazione|animatore)[:\s]+([^.|\n]+)/gi,
  // French
  /(?:animé par|animateur|animatrice)[:\s]+([^.|\n]+)/gi,
  /(?:présenté par)[:\s]+([^.|\n]+)/gi,
  // German
  /(?:moderiert von|moderation)[:\s]+([^.|\n]+)/gi,
];

const CO_ORGANIZER_PATTERNS = [
  /(?:co-organis(?:er|ed)|co-host(?:ed)?)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:in collaboration with|together with|partnered with)[:\s]+([^.|\n]+)/gi,
  /(?:and|&)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:present|host|bring)/gi,
];

const DJ_PATTERNS = [
  // English
  /(?:dj|d\.j\.|tdj|t\.d\.j\.)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:music by|tunes by|tandas by|played by)[:\s]+([^.|\n]+)/gi,
  /(?:spinning|playing)[:\s]+([^.|\n]+)/gi,
  /(?:dj set by|set by)[:\s]+([^.|\n]+)/gi,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:on the decks|spinning)/gi,
  // Spanish
  /(?:musicalizador|musicalizadora|musicalizadores)[:\s]+([^.|\n]+)/gi,
  /(?:musicaliza(?:do|ción)?)[:\s]+([^.|\n]+)/gi,
  /(?:música a cargo de|musica por)[:\s]+([^.|\n]+)/gi,
  /(?:tandas seleccionadas por)[:\s]+([^.|\n]+)/gi,
  // Italian
  /(?:musica di|musica da)[:\s]+([^.|\n]+)/gi,
  /(?:musicalizatore|musicalizatrice)[:\s]+([^.|\n]+)/gi,
  // French
  /(?:musique par|musique de)[:\s]+([^.|\n]+)/gi,
  /(?:sélection musicale)[:\s]+([^.|\n]+)/gi,
  // German
  /(?:musik von|dj-set von)[:\s]+([^.|\n]+)/gi,
  // Portuguese
  /(?:música por|musicalizador)[:\s]+([^.|\n]+)/gi,
];

const TEACHER_PATTERNS = [
  // English
  /(?:taught by|instruction by|class(?:es)? (?:with|by))[:\s]+([^.|\n]+)/gi,
  /(?:teacher|instructor|maestro|maestra)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:lesson|workshop|class) with[:\s]+([^.|\n]+)/gi,
  /(?:teaching)[:\s]+([^.|\n]+)/gi,
  /([A-Z][a-z]+(?:\s+(?:&|and)\s+[A-Z][a-z]+)?)\s+(?:teach(?:es|ing)?|instruct)/gi,
  // Spanish
  /(?:maestros?|maestras?)[:\s]+([^.|\n]+)/gi,
  /(?:profesores?|profesoras?)[:\s]+([^.|\n]+)/gi,
  /(?:clase(?:s)? con|taller(?:es)? con)[:\s]+([^.|\n]+)/gi,
  /(?:enseña(?:n)?|dicta(?:n)?)[:\s]+([^.|\n]+)/gi,
  // Italian
  /(?:insegnant[ei]|docent[ei])[:\s]+([^.|\n]+)/gi,
  /(?:lezione con|workshop con)[:\s]+([^.|\n]+)/gi,
  // French
  /(?:professeur[s]?|enseignant[s]?)[:\s]+([^.|\n]+)/gi,
  /(?:cours avec|stage avec)[:\s]+([^.|\n]+)/gi,
  // German
  /(?:lehrer|lehrerin|unterricht von)[:\s]+([^.|\n]+)/gi,
  // Portuguese
  /(?:professor(?:es|a|as)?|mestre(?:s)?)[:\s]+([^.|\n]+)/gi,
];

const PERFORMER_PATTERNS = [
  // English
  /(?:performance by|performing|exhibition by|show by)[:\s]+([^.|\n]+)/gi,
  /(?:performer|artist|guest artist)[s]?[:\s]+([^.|\n]+)/gi,
  /(?:special guest|featuring|feat\.?)[:\s]+([^.|\n]+)/gi,
  /(?:live performance|demo) by[:\s]+([^.|\n]+)/gi,
  /(?:live music|live band|orchestra)[:\s]+([^.|\n]+)/gi,
  /(?:orquesta|orquesta típica)[:\s]+([^.|\n]+)/gi,
  // Spanish
  /(?:show de tango|show de|exhibición de|presentación de)[:\s]+([^.|\n]+)/gi,
  /(?:actuación de|actuaciones de)[:\s]+([^.|\n]+)/gi,
  /(?:orquesta típica|orquesta)[:\s]+([^.|\n]+)/gi,
  /(?:música en vivo|banda en vivo)[:\s]+([^.|\n]+)/gi,
  /(?:artista invitado|artistas invitados)[:\s]+([^.|\n]+)/gi,
  // Italian
  /(?:esibizione di|spettacolo di)[:\s]+([^.|\n]+)/gi,
  /(?:orchestra|orchestra tipica)[:\s]+([^.|\n]+)/gi,
  /(?:musica dal vivo)[:\s]+([^.|\n]+)/gi,
  // French
  /(?:spectacle de|représentation de)[:\s]+([^.|\n]+)/gi,
  /(?:orchestre|orchestre typique)[:\s]+([^.|\n]+)/gi,
  /(?:musique live|groupe live)[:\s]+([^.|\n]+)/gi,
  // German
  /(?:auftritt von|show von|vorführung von)[:\s]+([^.|\n]+)/gi,
  /(?:orchester|livemusik von)[:\s]+([^.|\n]+)/gi,
  // Portuguese
  /(?:show de|apresentação de|espetáculo de)[:\s]+([^.|\n]+)/gi,
  /(?:orquestra|música ao vivo)[:\s]+([^.|\n]+)/gi,
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
 * Supports multiple languages:
 * - English: "and", "&"
 * - Spanish: "y" 
 * - Italian: "e"
 * - French: "et"
 * - German: "und"
 * - Portuguese: "e"
 */
function splitNameList(text: string): string[] {
  return text
    // Split on comma, ampersand, or language-specific "and" words
    // Use word boundaries \b to avoid splitting on "y" within names like "Yolanda"
    .split(/[,&]|\band\b|\by\b|\be\b|\bet\b|\bund\b/gi)
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

async function matchOrCreateProfile(
  name: string, 
  role: string,
  sourceId: number | null = null
): Promise<{ userId?: number; profileId?: number; confidence: number }> {
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
    
    // No match found - CREATE a new scraped profile
    console.log(`[MB.MD] Creating new scraped profile for: "${name}" (${role})`);
    const newProfileId = await createScrapedProfileInternal(name, role, sourceId);
    return { profileId: newProfileId, confidence: 0.5 };
    
  } catch (error) {
    // Skip on query errors (malformed names, etc.)
    console.error(`[MB.MD] Error matching user profile for "${name}":`, error);
  }
  
  return { confidence: 0 };
}

// Internal helper to create profile (called by matchOrCreateProfile)
async function createScrapedProfileInternal(
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
  
  console.log(`[MB.MD] Created scraped profile ID ${profile.id} for "${name}" (${role})`);
  return profile.id;
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
  const hostNames = extractNames(fullText, HOST_PATTERNS);
  
  for (const name of Array.from(new Set(organizerNames))) {
    const match = await matchOrCreateProfile(name, 'organizer');
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
      const match = await matchOrCreateProfile(name, 'co_organizer');
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
    const match = await matchOrCreateProfile(name, 'dj');
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
    const match = await matchOrCreateProfile(name, 'teacher');
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
    const match = await matchOrCreateProfile(name, 'performer');
    participants.push({
      name,
      role: 'performer',
      sourceText: 'Extracted from description',
      matchedUserId: match.userId,
      matchedProfileId: match.profileId,
      confidence: match.confidence
    });
  }
  
  for (const name of Array.from(new Set(hostNames))) {
    // Skip if already added as organizer
    if (!organizerNames.includes(name) && !coOrganizerNames.includes(name)) {
      const match = await matchOrCreateProfile(name, 'host');
      participants.push({
        name,
        role: 'host',
        sourceText: 'Extracted from description',
        matchedUserId: match.userId,
        matchedProfileId: match.profileId,
        confidence: match.confidence
      });
    }
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

// Re-export internal function for external use
export const createScrapedProfile = createScrapedProfileInternal;
