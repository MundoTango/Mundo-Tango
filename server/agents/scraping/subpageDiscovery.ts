/**
 * SUBPAGE DISCOVERY SERVICE
 * Shared utility for discovering and scraping team member subpages (DJs, Teachers, etc.)
 * Used by all scrapers to follow navigation links and extract team data
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface TeamData {
  djs: string[];
  teachers: string[];
  performers: string[];
  hosts: string[];
  organizers: string[];
}

export interface SubpageDiscoveryOptions {
  maxSubpages?: number;
  timeout?: number;
  userAgent?: string;
}

const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];

const SUBPAGE_PATTERNS: { pattern: RegExp; role: keyof TeamData }[] = [
  { pattern: /\/dj[s]?(?:[\/\?#]|$)/i, role: 'djs' },
  { pattern: /\/musicali[sz]ador/i, role: 'djs' },
  { pattern: /\/music(?:a|ians?)?(?:[\/\?#]|$)/i, role: 'djs' },
  { pattern: /\/teacher[s]?(?:[\/\?#]|$)/i, role: 'teachers' },
  { pattern: /\/maestro[s]?(?:[\/\?#]|$)/i, role: 'teachers' },
  { pattern: /\/instructor[s]?(?:[\/\?#]|$)/i, role: 'teachers' },
  { pattern: /\/professor[es]?(?:[\/\?#]|$)/i, role: 'teachers' },
  { pattern: /\/artist[s]?(?:[\/\?#]|$)/i, role: 'performers' },
  { pattern: /\/performer[s]?(?:[\/\?#]|$)/i, role: 'performers' },
  { pattern: /\/orchestra[s]?(?:[\/\?#]|$)/i, role: 'performers' },
  { pattern: /\/orquesta[s]?(?:[\/\?#]|$)/i, role: 'performers' },
  { pattern: /\/band[s]?(?:[\/\?#]|$)/i, role: 'performers' },
  { pattern: /\/show[s]?(?:[\/\?#]|$)/i, role: 'performers' },
  { pattern: /\/host[s]?(?:[\/\?#]|$)/i, role: 'hosts' },
  { pattern: /\/staff(?:[\/\?#]|$)/i, role: 'hosts' },
  { pattern: /\/team(?:[\/\?#]|$)/i, role: 'hosts' },
  { pattern: /\/organizer[s]?(?:[\/\?#]|$)/i, role: 'organizers' },
  { pattern: /\/organiser[s]?(?:[\/\?#]|$)/i, role: 'organizers' },
];

const NAME_SELECTORS = [
  'h1, h2, h3, h4, h5, h6',
  '[class*="name"]',
  '[class*="artist"]',
  '[class*="teacher"]',
  '[class*="dj"]',
  '[class*="person"]',
  '[class*="team"]',
  '[class*="member"]',
  '.card-title',
  '.profile-name',
  'figcaption',
];

const SKIP_WORDS = /^(home|about|contact|menu|schedule|register|book|more|info|facebook|instagram|twitter|youtube|email|phone|map|calendar|gallery|photos|videos|news|blog|shop|store|cart|login|signup|sign in|faq|terms|privacy|copyright|all rights|©)/i;

const NAME_PATTERN = /^([A-ZÀ-Ÿ][a-zà-ÿ]+(?:[-'][A-ZÀ-Ÿa-zà-ÿ]+)?(?:\s+(?:&|and|et|y|e|und|\+)\s+)?(?:[A-ZÀ-Ÿ][a-zà-ÿ]+[-']?)+(?:\s+[A-ZÀ-Ÿ]?[a-zà-ÿ]+)?)\s*(?:[-–]\s*[A-Z]{2,3})?$/;

async function fetchPage(url: string, options: SubpageDiscoveryOptions): Promise<string> {
  const userAgent = options.userAgent || DEFAULT_USER_AGENTS[Math.floor(Math.random() * DEFAULT_USER_AGENTS.length)];
  
  const response = await axios.get(url, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9,es;q=0.8,de;q=0.7,fr;q=0.6'
    },
    timeout: options.timeout || 15000
  });

  return response.data;
}

function extractNamesFromPage(html: string): string[] {
  const $ = cheerio.load(html);
  const names: string[] = [];
  
  for (const selector of NAME_SELECTORS) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim();
      
      if (text.length < 3 || text.length > 60) return;
      if (SKIP_WORDS.test(text)) return;
      
      if (NAME_PATTERN.test(text)) {
        const cleanName = text.replace(/\s*[-–]\s*[A-Z]{2,3}$/, '').trim();
        if (cleanName.length >= 3 && !names.includes(cleanName)) {
          names.push(cleanName);
        }
      }
    });
  }
  
  return names;
}

export async function discoverTeamFromSubpages(
  baseUrl: string, 
  mainHtml: string,
  options: SubpageDiscoveryOptions = {}
): Promise<TeamData> {
  const result: TeamData = { 
    djs: [], 
    teachers: [], 
    performers: [], 
    hosts: [], 
    organizers: [] 
  };
  
  const $ = cheerio.load(mainHtml);
  const maxSubpages = options.maxSubpages || 10;
  let subpagesProcessed = 0;
  
  const links = new Set<string>();
  let baseOrigin: string;
  
  try {
    baseOrigin = new URL(baseUrl).origin;
  } catch {
    return result;
  }
  
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    
    try {
      const absoluteUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
      if (absoluteUrl.startsWith(baseOrigin)) {
        links.add(absoluteUrl);
      }
    } catch {}
  });
  
  for (const link of links) {
    if (subpagesProcessed >= maxSubpages) break;
    
    for (const { pattern, role } of SUBPAGE_PATTERNS) {
      if (pattern.test(link)) {
        try {
          console.log(`[SubpageDiscovery] 🔍 Found ${role} page: ${link}`);
          const subpageHtml = await fetchPage(link, options);
          const names = extractNamesFromPage(subpageHtml);
          
          if (names.length > 0) {
            result[role].push(...names);
            console.log(`[SubpageDiscovery] 👥 Extracted ${names.length} ${role}: ${names.slice(0, 3).join(', ')}${names.length > 3 ? '...' : ''}`);
          }
          
          subpagesProcessed++;
        } catch (err) {
          console.log(`[SubpageDiscovery] Could not fetch: ${link}`);
        }
        break;
      }
    }
  }
  
  result.djs = [...new Set(result.djs)];
  result.teachers = [...new Set(result.teachers)];
  result.performers = [...new Set(result.performers)];
  result.hosts = [...new Set(result.hosts)];
  result.organizers = [...new Set(result.organizers)];
  
  return result;
}

export function formatTeamForDescription(teamData: TeamData): string {
  const parts: string[] = [];
  
  if (teamData.teachers.length > 0) {
    parts.push(`Maestros: ${teamData.teachers.join(', ')}`);
  }
  if (teamData.djs.length > 0) {
    parts.push(`DJs: ${teamData.djs.join(', ')}`);
  }
  if (teamData.performers.length > 0) {
    parts.push(`Performers: ${teamData.performers.join(', ')}`);
  }
  if (teamData.hosts.length > 0) {
    parts.push(`Hosts: ${teamData.hosts.join(', ')}`);
  }
  if (teamData.organizers.length > 0) {
    parts.push(`Organizers: ${teamData.organizers.join(', ')}`);
  }
  
  return parts.join('\n');
}

export function hasTeamData(teamData: TeamData): boolean {
  return (
    teamData.djs.length > 0 ||
    teamData.teachers.length > 0 ||
    teamData.performers.length > 0 ||
    teamData.hosts.length > 0 ||
    teamData.organizers.length > 0
  );
}
