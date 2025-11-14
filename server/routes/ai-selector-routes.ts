import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';
import { users, eventScrapingSources } from '@shared/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = Router();

interface SelectorResult {
  sourceId: number;
  sourceName: string;
  url: string;
  selectors: {
    eventList: string[];
    title: string[];
    date: string[];
    location: string[];
    description: string[];
    price?: string[];
    image?: string[];
  };
  confidence: number;
  htmlPreview: string;
  sampleExtraction?: any;
}

/**
 * AI-Powered Selector Generation
 * Uses GPT-4 to analyze HTML and generate Cheerio selectors
 */
router.post('/admin/generate-selectors', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    const { sourceIds, limit = 10 } = req.body;

    if (!sourceIds || !Array.isArray(sourceIds)) {
      return res.status(400).json({ 
        error: 'sourceIds array required',
        example: { sourceIds: [1, 2, 3], limit: 10 }
      });
    }

    // Fetch sources
    const sources = await db.query.eventScrapingSources.findMany({
      where: eq(eventScrapingSources.platform, 'website'),
      limit: limit
    });

    const selectedSources = sources.filter(s => sourceIds.includes(s.id));

    if (selectedSources.length === 0) {
      return res.status(404).json({ error: 'No matching sources found' });
    }

    console.log(`[AI Selector] Generating selectors for ${selectedSources.length} sources...`);

    const results: SelectorResult[] = [];

    for (const source of selectedSources) {
      try {
        const result = await generateSelectorsForSource(source);
        results.push(result);

        // Save to database if confidence is acceptable (>40%)
        if (result.confidence > 40) {
          await db.update(eventScrapingSources)
            .set({ 
              customSelectors: result.selectors,
              updatedAt: new Date()
            })
            .where(eq(eventScrapingSources.id, source.id));
          
          console.log(`[AI Selector] ✅ Saved selectors for ${source.name} (confidence: ${result.confidence}%)`);
        } else {
          console.log(`[AI Selector] ⚠️ Skipped ${source.name} - low confidence (${result.confidence}%)`);
        }
      } catch (error: any) {
        console.error(`[AI Selector] Failed for ${source.name}:`, error.message);
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          url: source.url,
          selectors: {
            eventList: [],
            title: [],
            date: [],
            location: [],
            description: []
          },
          confidence: 0,
          htmlPreview: '',
          sampleExtraction: { error: error.message }
        });
      }
    }

    res.json({
      success: true,
      totalProcessed: results.length,
      saved: results.filter(r => r.confidence > 40).length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI Selector] Route error:', error);
    res.status(500).json({ error: 'Failed to generate selectors' });
  }
});

/**
 * Generate selectors for a single source using GPT-4
 */
async function generateSelectorsForSource(source: any): Promise<SelectorResult> {
  console.log(`[AI Selector] Processing: ${source.name}`);

  // Fetch HTML
  const html = await fetchHTML(source.url);
  const $ = cheerio.load(html);

  // Extract text preview (first 2000 chars of body text)
  const bodyText = $('body').text().substring(0, 2000);
  
  // Extract HTML structure (simplified)
  const htmlStructure = extractHTMLStructure($);

  // Call GPT-4 to generate selectors
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

  const prompt = `You are an expert web scraper. Analyze this tango event website and generate Cheerio selectors to extract event data.

URL: ${source.url}
City: ${source.city}, ${source.country}

HTML Structure:
${htmlStructure}

Body Text Preview:
${bodyText}

Generate JSON with these selector arrays (provide 2-3 alternatives for each):
{
  "eventList": ["selector for event container/item"],
  "title": ["selector for event title/name"],
  "date": ["selector for event date/time"],
  "location": ["selector for venue/location"],
  "description": ["selector for event description"],
  "price": ["selector for price (optional)"],
  "image": ["selector for event image (optional)"]
}

Rules:
1. Use CSS selectors compatible with Cheerio
2. Prioritize semantic HTML (article, time, h2, etc.)
3. Include class-based selectors as fallbacks
4. Look for tango-specific terms: milonga, practica, workshop, clase
5. Date selectors should find datetime attributes or date text
6. Return ONLY valid JSON, no explanation

Example output:
{
  "eventList": [".event-item", "article.milonga", ".calendar-event"],
  "title": ["h2.event-title", ".event-name", "h3"],
  "date": ["time[datetime]", ".event-date", ".date"],
  "location": [".venue", ".location", "[itemprop='location']"],
  "description": [".description", "p.event-info", ".details"]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a web scraping expert. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  const responseText = completion.choices[0].message.content || '{}';
  const selectors = JSON.parse(responseText);

  // Test selectors
  const sampleExtraction = testSelectors($, selectors);

  return {
    sourceId: source.id,
    sourceName: source.name,
    url: source.url,
    selectors,
    confidence: calculateConfidence(sampleExtraction),
    htmlPreview: htmlStructure.substring(0, 500),
    sampleExtraction
  };
}

/**
 * Fetch HTML with user agent
 */
async function fetchHTML(url: string): Promise<string> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 30000
  });

  return response.data;
}

/**
 * Extract simplified HTML structure for GPT-4
 */
function extractHTMLStructure($: cheerio.CheerioAPI): string {
  const structure: string[] = [];

  // Find all elements with classes related to events
  $('[class*="event"], [class*="milonga"], [class*="calendar"], article, .item').each((i, elem) => {
    if (i >= 5) return false; // Limit to first 5 examples
    const $elem = $(elem);
    const tag = elem.tagName;
    const classes = $elem.attr('class') || '';
    const id = $elem.attr('id') || '';
    const text = $elem.text().substring(0, 100).trim();
    
    structure.push(`<${tag} class="${classes}" id="${id}">${text}...</${tag}>`);
  });

  return structure.join('\n');
}

/**
 * Test generated selectors on actual HTML
 */
function testSelectors($: cheerio.CheerioAPI, selectors: any): any {
  const results: any = {
    eventsFound: 0,
    samples: []
  };

  // Try event list selectors
  for (const selector of selectors.eventList || []) {
    const elements = $(selector);
    if (elements.length > 0) {
      results.eventsFound = elements.length;
      
      // Extract first 3 events as samples
      elements.slice(0, 3).each((i, elem) => {
        const $elem = $(elem);
        const sample: any = {};

        // Try title selectors
        for (const titleSel of selectors.title || []) {
          const title = $elem.find(titleSel).first().text().trim();
          if (title) {
            sample.title = title;
            break;
          }
        }

        // Try date selectors
        for (const dateSel of selectors.date || []) {
          const $date = $elem.find(dateSel).first();
          const date = $date.attr('datetime') || $date.text().trim();
          if (date) {
            sample.date = date;
            break;
          }
        }

        // Try location selectors
        for (const locSel of selectors.location || []) {
          const location = $elem.find(locSel).first().text().trim();
          if (location) {
            sample.location = location;
            break;
          }
        }

        if (sample.title || sample.date) {
          results.samples.push(sample);
        }
      });

      break; // Found working selector
    }
  }

  return results;
}

/**
 * Calculate confidence score (0-100)
 */
function calculateConfidence(extraction: any): number {
  if (!extraction || !extraction.samples || extraction.samples.length === 0) {
    return 0;
  }

  let score = 0;
  const samples = extraction.samples;

  // Base score: found events
  if (extraction.eventsFound > 0) score += 40;

  // Title extraction
  const titlesFound = samples.filter((s: any) => s.title).length;
  score += (titlesFound / samples.length) * 30;

  // Date extraction
  const datesFound = samples.filter((s: any) => s.date).length;
  score += (datesFound / samples.length) * 20;

  // Location extraction
  const locationsFound = samples.filter((s: any) => s.location).length;
  score += (locationsFound / samples.length) * 10;

  return Math.round(score);
}

export default router;
