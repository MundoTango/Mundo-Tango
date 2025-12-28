/**
 * Conversation Orchestrator
 * MB.MD v9.2 - Self-Healing System Integration
 * November 19, 2025
 * 
 * Orchestrates Mr Blue conversations with intelligent routing:
 * - Questions → GROQ answers (NO code generation)
 * - Actions → VibeCoding workflow
 * - Page Analysis → Activate → Audit → Self-Heal
 * 
 * Performance Targets:
 * - Intent classification: <100ms
 * - Context enrichment (RAG): <200ms
 * - Question handling: <2000ms
 * - Page analysis: <1000ms (activation + audit)
 */

import Groq from 'groq-sdk';
import { contextService } from './mrBlue/ContextService';
// MB.MD Pattern: Lazy-loaded to avoid circular dependencies
// import { vibeCodingService } from './mrBlue/VibeCodingService';
import { AgentActivationService } from './self-healing/AgentActivationService';
import { PageAuditService } from './self-healing/PageAuditService';
import { SelfHealingService } from './self-healing/SelfHealingService';
import { db } from '../db';
import { events, cities, housingListings, travelPlans, users } from '@shared/schema';
import { gte, lte, and, or, ilike, asc, eq, sql, desc } from 'drizzle-orm';

// Lazy-loaded VibeCodingService
let vibeCodingServiceInstance: any = null;
async function getLazyVibeCodingService() {
  if (!vibeCodingServiceInstance) {
    const { vibeCodingService } = await import('./mrBlue/VibeCodingService');
    vibeCodingServiceInstance = vibeCodingService;
  }
  return vibeCodingServiceInstance;
}

// Initialize GROQ client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

export interface Intent {
  type: 'question' | 'action' | 'page_analysis' | 'unknown';
  confidence: number;
  reasoning: string;
}

export interface EnrichedMessage {
  originalMessage: string;
  contextChunks: any[];
  relevanceScore: number;
}

export interface QuestionResponse {
  success: true;
  mode: 'question';
  response: string;
  sources: string[];
}

export interface ActionResponse {
  success: boolean;
  mode: 'action';
  vibecodingResult: any;
  requiresApproval: boolean;
}

export interface PageAnalysisResult {
  success: boolean;
  pageId: string;
  activation: {
    totalAgents: number;
    activationTime: number;
  };
  audit: {
    totalIssues: number;
    criticalIssues: number;
    issuesByCategory: any;
    auditDurationMs: number;
  };
  healing?: {
    issuesFixed: number;
    healingDurationMs: number;
    success: boolean;
  };
  totalTime: number;
}

export class ConversationOrchestrator {
  /**
   * Classify user intent: Question vs Action vs Page Analysis
   * 2-tier system: Questions first (what/where/when), then Actions (add/create/fix)
   * Target: <100ms
   */
  async classifyIntent(message: string): Promise<Intent> {
    const startTime = Date.now();
    const msg = message.toLowerCase();

    // TIER 0: UI/Code modification requests (HIGHEST PRIORITY - MB.MD v9.2 ENHANCED)
    const uiModificationKeywords = [
      // Explicit vibecoding
      'vibe code',
      'vibecod',
      'vibe cod',
      'can you code',
      'can you vibe',
      'generate code',
      'write code',
      'code this',
      'code that',
      // UI modification patterns (NEW - Nov 19, 2025)
      'make the',
      'change the',
      'make it',
      'change it to',
      'turn the',
      'set the',
      'color to',
      'color the',
      'style the',
      'resize the',
      'move the',
      'add a button',
      'add a',
      'create a button',
      'create a',
      'remove the',
      'hide the',
      'show the',
      'display the',
    ];

    for (const keyword of uiModificationKeywords) {
      if (msg.includes(keyword)) {
        console.log(`[Orchestrator] 🎯 UI MODIFICATION intent detected: "${keyword}" (${Date.now() - startTime}ms)`);
        return {
          type: 'action',
          confidence: 0.99,
          reasoning: `UI modification request: "${keyword}"`
        };
      }
    }

    // Tier 1: Check for page analysis intent
    const pageAnalysisKeywords = [
      'analyze page',
      'audit page',
      'check page',
      'scan page',
      'inspect page',
      'page health',
      'page status',
    ];

    for (const keyword of pageAnalysisKeywords) {
      if (msg.includes(keyword)) {
        console.log(`[Orchestrator] 🎯 Page Analysis intent detected (${Date.now() - startTime}ms)`);
        return {
          type: 'page_analysis',
          confidence: 0.95,
          reasoning: `Matched keyword: "${keyword}"`
        };
      }
    }

    // Tier 2: Check for question intent (CONTEXT-AWARE - MB.MD v9.2 FIX)
    const questionKeywords = [
      'what is',
      'what are',
      'what\'s wrong',
      'where is',
      'where can',
      'when does',
      'when will',
      'why is',
      'why does',
      'how do',
      'who is',
      'who are',
      'explain',
      'tell me',
      'describe',
    ];

    for (const keyword of questionKeywords) {
      if (msg.includes(keyword)) {
        console.log(`[Orchestrator] ❓ Question intent detected (${Date.now() - startTime}ms)`);
        return {
          type: 'question',
          confidence: 0.90,
          reasoning: `Matched question keyword: "${keyword}"`
        };
      }
    }

    // Tier 3: Check for action intent
    const actionKeywords = [
      'add',
      'create',
      'make',
      'build',
      'implement',
      'fix',
      'change',
      'modify',
      'update',
      'remove',
      'delete',
      'refactor',
      'improve',
      'optimize',
    ];

    for (const keyword of actionKeywords) {
      if (msg.includes(keyword)) {
        console.log(`[Orchestrator] 🔨 Action intent detected (${Date.now() - startTime}ms)`);
        return {
          type: 'action',
          confidence: 0.85,
          reasoning: `Matched action keyword: "${keyword}"`
        };
      }
    }

    // Default: Treat as question (safer fallback)
    console.log(`[Orchestrator] ⚠️ Unknown intent - defaulting to question (${Date.now() - startTime}ms)`);
    return {
      type: 'question',
      confidence: 0.50,
      reasoning: 'No clear intent keywords found, defaulting to question'
    };
  }

  /**
   * Enrich message with RAG context
   * Uses contextService.search() for semantic retrieval
   * Target: <200ms
   */
  async enrichWithContext(message: string): Promise<EnrichedMessage> {
    const startTime = Date.now();

    try {
      // Search documentation for relevant context
      const contextChunks = await contextService.search(message, 5);

      const duration = Date.now() - startTime;
      console.log(`[Orchestrator] 📚 Context enrichment complete: ${contextChunks.length} chunks in ${duration}ms`);

      // Calculate relevance score (average similarity)
      const relevanceScore = contextChunks.length > 0
        ? contextChunks.reduce((sum, chunk) => sum + (chunk.similarity || 0), 0) / contextChunks.length
        : 0;

      return {
        originalMessage: message,
        contextChunks,
        relevanceScore
      };
    } catch (error) {
      console.error('[Orchestrator] ❌ Context enrichment failed:', error);
      return {
        originalMessage: message,
        contextChunks: [],
        relevanceScore: 0
      };
    }
  }

  /**
   * MB.MD v9.4: Detect if message is asking about events
   * ENHANCED: Added marathon, encuentro, country names, date phrases
   */
  private isEventsQuestion(message: string): boolean {
    const msg = message.toLowerCase();
    const eventKeywords = [
      // Event types (including missing marathon/encuentro - 146 events!)
      'event', 'milonga', 'practica', 'festival', 'workshop', 'class',
      'marathon', 'encuentro', 'intensive', 'bootcamp', 'show', 'performance',
      // General terms
      'tango', 'dance', 'happening', 'going on', 'schedule', 'calendar',
      'upcoming', 'this week', 'this month', 'tonight', 'tomorrow',
      'next week', 'next month', 'this weekend', 'until april', 'until may',
      'where can i dance', 'where to dance', 'places to dance',
      // Country-based queries (top 15 countries in DB)
      'in usa', 'in united states', 'in argentina', 'in italy', 'in poland',
      'in germany', 'in france', 'in spain', 'in greece', 'in turkey',
      'in portugal', 'in romania', 'in slovenia', 'in czechia', 'in hungary',
      'in europe', 'in south america', 'in north america'
    ];
    return eventKeywords.some(kw => msg.includes(kw));
  }

  /**
   * MB.MD v9.4: Detect if message is asking about cities
   * FIXED: Tightened to require city-specific language
   */
  private isCityQuestion(message: string): boolean {
    const msg = message.toLowerCase();
    const cityKeywords = [
      // City-specific terms only (removed generic phrases)
      'city', 'cities', 'tango scene', 'scene in',
      'best cities', 'popular cities', 'top cities', 'tango capital',
      'weekly milongas', 'regular milongas', 'local scene',
      'tango community in', 'dancer community in', 'tango culture in'
    ];
    return cityKeywords.some(kw => msg.includes(kw));
  }

  /**
   * MB.MD v9.4: Detect if message is asking about housing
   */
  private isHousingQuestion(message: string): boolean {
    const msg = message.toLowerCase();
    const housingKeywords = [
      'housing', 'stay', 'apartment', 'accommodation', 'place to stay',
      'where to stay', 'airbnb', 'room', 'rent', 'host', 'sleep',
      'booking', 'tango apartment', 'dancer host', 'dance floor',
      'practice space', 'near milonga'
    ];
    return housingKeywords.some(kw => msg.includes(kw));
  }

  /**
   * MB.MD v9.4: Detect if message is asking about travelers
   */
  private isTravelersQuestion(message: string): boolean {
    const msg = message.toLowerCase();
    const travelersKeywords = [
      'who is going', 'who\'s going', 'who else', 'other dancers',
      'travelers', 'visitors', 'attending', 'fellow dancers',
      'meet dancers', 'people going', 'friends going'
    ];
    return travelersKeywords.some(kw => msg.includes(kw));
  }

  /**
   * MB.MD v9.3: Detect if message is about travel planning
   */
  private isTravelPlanningRequest(message: string): boolean {
    const msg = message.toLowerCase();
    const travelKeywords = [
      'travel', 'trip', 'visit', 'going to', 'plan', 'interested',
      'want to go', 'i\'d like to go', 'add to', 'mark as interested',
      'create travel plan', 'book', 'attend'
    ];
    return travelKeywords.some(kw => msg.includes(kw));
  }

  /**
   * MB.MD v9.4: Query events from database
   * ENHANCED: Now supports country, type, and date-range filters
   */
  private async getEventsContext(message: string, limit: number = 15): Promise<string> {
    try {
      const msg = message.toLowerCase();
      const now = new Date();
      
      // Extract filters from message
      const filters = this.extractEventFilters(msg);
      
      // Build conditions array
      const conditions: any[] = [gte(events.startDate, now)];
      
      // Country filter
      if (filters.country) {
        conditions.push(ilike(events.country, `%${filters.country}%`));
      }
      
      // City filter
      if (filters.city) {
        conditions.push(ilike(events.city, `%${filters.city}%`));
      }
      
      // Event type filter (marathon, encuentro, festival, etc.)
      if (filters.eventType) {
        conditions.push(or(
          ilike(events.eventType, `%${filters.eventType}%`),
          ilike(events.title, `%${filters.eventType}%`)
        ));
      }
      
      // Date range filter
      if (filters.endDate) {
        conditions.push(lte(events.startDate, filters.endDate));
      }

      const upcomingEvents = await db.select({
        id: events.id,
        title: events.title,
        eventType: events.eventType,
        startDate: events.startDate,
        endDate: events.endDate,
        city: events.city,
        country: events.country,
        venue: events.venue,
        price: events.price,
        description: events.description,
      })
      .from(events)
      .where(and(...conditions))
      .orderBy(asc(events.startDate))
      .limit(Math.min(limit, 20));

      if (upcomingEvents.length === 0) {
        const filterDesc = [
          filters.country && `country: ${filters.country}`,
          filters.city && `city: ${filters.city}`,
          filters.eventType && `type: ${filters.eventType}`,
        ].filter(Boolean).join(', ');
        return `No upcoming events found${filterDesc ? ` matching ${filterDesc}` : ''}. Try broadening your search.`;
      }

      const filterInfo = [
        filters.country && `Country: ${filters.country}`,
        filters.city && `City: ${filters.city}`,
        filters.eventType && `Type: ${filters.eventType}`,
        filters.endDate && `Until: ${filters.endDate.toLocaleDateString()}`,
      ].filter(Boolean).join(' | ');

      console.log(`[Orchestrator] 📅 Found ${upcomingEvents.length} events. Filters: ${filterInfo || 'none'}`);

      const eventsSummary = upcomingEvents.map((evt, i) => {
        const startDate = evt.startDate ? new Date(evt.startDate).toLocaleDateString('en-US', { 
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        }) : 'TBD';
        const endDateStr = evt.endDate ? ` - ${new Date(evt.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '';
        return `${i + 1}. **${evt.title}** (ID: ${evt.id})
   - Type: ${evt.eventType || 'Event'}
   - Dates: ${startDate}${endDateStr}
   - Location: ${evt.city || ''}, ${evt.country || ''}${evt.venue ? ` @ ${evt.venue}` : ''}
   - Price: ${evt.price ? `$${evt.price}` : 'Check event page'}`;
      }).join('\n\n');

      return `MUNDO TANGO EVENTS (${upcomingEvents.length} found)${filterInfo ? `\nFilters: ${filterInfo}` : ''}:

${eventsSummary}

HELPFUL ACTIONS:
1. Ask "I want to go to [Event Name]" to mark as interested
2. Ask "Where can I stay in [City]?" for housing options
3. Ask "Who else is going to [Event]?" to find fellow travelers`;
    } catch (error) {
      console.error('[Orchestrator] ❌ Events query failed:', error);
      return 'Unable to fetch events data at this time.';
    }
  }

  /**
   * MB.MD v9.4: Extract filters from user message
   */
  private extractEventFilters(msg: string): { country?: string; city?: string; eventType?: string; endDate?: Date } {
    const filters: { country?: string; city?: string; eventType?: string; endDate?: Date } = {};
    
    // Country extraction
    const countryMap: Record<string, string> = {
      'usa': 'United States', 'united states': 'United States', 'america': 'United States',
      'argentina': 'Argentina', 'italy': 'Italy', 'poland': 'Poland', 'germany': 'Germany',
      'france': 'France', 'spain': 'Spain', 'greece': 'Greece', 'turkey': 'Turkey',
      'türkiye': 'Turkey', 'portugal': 'Portugal', 'romania': 'Romania', 'slovenia': 'Slovenia',
      'czechia': 'Czechia', 'hungary': 'Hungary', 'uk': 'United Kingdom', 'england': 'United Kingdom',
      'netherlands': 'Netherlands', 'belgium': 'Belgium', 'austria': 'Austria', 'switzerland': 'Switzerland'
    };
    
    for (const [key, value] of Object.entries(countryMap)) {
      if (msg.includes(key)) {
        filters.country = value;
        break;
      }
    }
    
    // Event type extraction
    const typeMap: Record<string, string> = {
      'marathon': 'marathon', 'marathons': 'marathon',
      'encuentro': 'encuentro', 'encuentros': 'encuentro',
      'festival': 'festival', 'festivals': 'festival',
      'workshop': 'workshop', 'workshops': 'workshop',
      'milonga': 'milonga', 'milongas': 'milonga',
      'practica': 'practica', 'practicas': 'practica',
      'intensive': 'intensive', 'bootcamp': 'bootcamp'
    };
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (msg.includes(key)) {
        filters.eventType = value;
        break;
      }
    }
    
    // Date range extraction
    const now = new Date();
    if (msg.includes('this week')) {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      filters.endDate = endOfWeek;
    } else if (msg.includes('this weekend')) {
      const endOfWeekend = new Date(now);
      endOfWeekend.setDate(now.getDate() + (7 - now.getDay() + 1));
      filters.endDate = endOfWeekend;
    } else if (msg.includes('this month')) {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filters.endDate = endOfMonth;
    } else if (msg.includes('next month')) {
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      filters.endDate = endOfNextMonth;
    } else {
      // Parse "until [month]" patterns
      const monthMatch = msg.match(/until\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i);
      if (monthMatch) {
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthIndex = monthNames.indexOf(monthMatch[1].toLowerCase());
        if (monthIndex !== -1) {
          let year = now.getFullYear();
          if (monthIndex < now.getMonth()) year++;
          filters.endDate = new Date(year, monthIndex + 1, 0);
        }
      }
    }
    
    // City extraction - FIXED: Handles multi-word countries like "United States", "Costa Rica"
    const cityMatch = msg.match(/in\s+([a-z\s]+?)(?:\s+this|\s+next|\s+upcoming|\s+until|$|\?)/i);
    if (cityMatch) {
      let possibleCity = cityMatch[1].trim().toLowerCase();
      
      // Multi-word country phrases to strip (ordered by length for greedy matching)
      const multiWordCountries = [
        'united states', 'south america', 'north america', 'costa rica', 'new zealand',
        'united kingdom', 'czech republic', 'dominican republic'
      ];
      
      // Single word country terms
      const singleWordCountries = [
        'usa', 'europe', 'america', 'argentina', 'italy', 'germany', 'france', 'spain',
        'poland', 'greece', 'turkey', 'portugal', 'netherlands', 'belgium', 'austria',
        'switzerland', 'uk', 'england', 'brazil', 'mexico', 'canada', 'japan', 'australia'
      ];
      
      // Check if the entire phrase is just a country (no city)
      const allCountries = [...multiWordCountries, ...singleWordCountries];
      if (allCountries.includes(possibleCity)) {
        // The whole phrase is a country, no city to extract
        return filters;
      }
      
      // Strip multi-word countries from the end of the city string
      for (const country of multiWordCountries) {
        if (possibleCity.endsWith(country)) {
          possibleCity = possibleCity.slice(0, -country.length).trim();
          break;
        }
      }
      
      // Strip single-word countries from the end
      const words = possibleCity.split(/\s+/);
      if (words.length > 1 && singleWordCountries.includes(words[words.length - 1])) {
        words.pop();
        possibleCity = words.join(' ');
      }
      
      // Set city if we have something left
      if (possibleCity && possibleCity.length > 0) {
        filters.city = possibleCity;
      }
    }
    
    return filters;
  }

  /**
   * MB.MD v9.4: Query cities from database
   */
  private async getCitiesContext(message: string, limit: number = 10): Promise<string> {
    try {
      const msg = message.toLowerCase();
      
      // Extract city name if asking about specific city
      const cityMatch = msg.match(/(?:about|in|scene in|tell me about)\s+([a-z\s]+?)(?:\s+tango|\s+scene|$|\?)/i);
      const cityName = cityMatch ? cityMatch[1].trim() : null;
      
      let cityResults;
      
      if (cityName) {
        // Specific city query
        cityResults = await db.select({
          id: cities.id,
          name: cities.name,
          slug: cities.slug,
          country: cities.country,
          region: cities.region,
          description: cities.description,
          memberCount: cities.memberCount,
          eventCount: cities.eventCount,
          venueCount: cities.venueCount,
          housingCount: cities.housingCount,
        })
        .from(cities)
        .where(or(
          ilike(cities.name, `%${cityName}%`),
          ilike(cities.slug, `%${cityName.replace(/\s+/g, '-')}%`)
        ))
        .limit(5);
      } else {
        // Get top cities by event count
        cityResults = await db.select({
          id: cities.id,
          name: cities.name,
          slug: cities.slug,
          country: cities.country,
          region: cities.region,
          description: cities.description,
          memberCount: cities.memberCount,
          eventCount: cities.eventCount,
          venueCount: cities.venueCount,
          housingCount: cities.housingCount,
        })
        .from(cities)
        .where(gte(cities.eventCount, 1))
        .orderBy(desc(cities.eventCount))
        .limit(limit);
      }

      if (cityResults.length === 0) {
        return cityName 
          ? `No city found matching "${cityName}". Try a different city name.`
          : 'No cities with events found in the database.';
      }

      console.log(`[Orchestrator] 🏙️ Found ${cityResults.length} cities`);

      const citiesSummary = cityResults.map((city, i) => {
        return `${i + 1}. **${city.name}**, ${city.country}
   - Members: ${city.memberCount || 0} | Events: ${city.eventCount || 0}
   - Venues: ${city.venueCount || 0} | Housing: ${city.housingCount || 0}
   - Page: /cities/${city.slug}
   ${city.description ? `   - ${city.description.substring(0, 150)}...` : ''}`;
      }).join('\n\n');

      return `MUNDO TANGO CITIES (${cityResults.length} found):

${citiesSummary}

CITY PAGES include:
- Discussion tab for local community
- Events tab with upcoming milongas, festivals
- Housing tab for tango-friendly accommodations
- Members tab to connect with local dancers`;
    } catch (error) {
      console.error('[Orchestrator] ❌ Cities query failed:', error);
      return 'Unable to fetch cities data at this time.';
    }
  }

  /**
   * MB.MD v9.4: Query housing from database
   */
  private async getHousingContext(message: string, limit: number = 10): Promise<string> {
    try {
      const msg = message.toLowerCase();
      
      // Extract city name
      const cityMatch = msg.match(/(?:stay in|housing in|apartment in|where to stay in)\s+([a-z\s]+?)(?:\s+for|$|\?)/i);
      const cityName = cityMatch ? cityMatch[1].trim() : null;
      
      const conditions: any[] = [eq(housingListings.status, 'active')];
      if (cityName) {
        conditions.push(ilike(housingListings.city, `%${cityName}%`));
      }

      const housingResults = await db.select({
        id: housingListings.id,
        title: housingListings.title,
        city: housingListings.city,
        country: housingListings.country,
        propertyType: housingListings.propertyType,
        pricePerNight: housingListings.pricePerNight,
        currency: housingListings.currency,
        bedrooms: housingListings.bedrooms,
        maxGuests: housingListings.maxGuests,
        amenities: housingListings.amenities,
        averageRating: housingListings.averageRating,
      })
      .from(housingListings)
      .where(and(...conditions))
      .limit(limit);

      if (housingResults.length === 0) {
        return cityName 
          ? `No housing listings found in ${cityName}. The housing marketplace is growing - consider checking nearby cities or Airbnb.`
          : 'No active housing listings found. The housing marketplace is new and growing!';
      }

      console.log(`[Orchestrator] 🏠 Found ${housingResults.length} housing listings`);

      const housingSummary = housingResults.map((listing, i) => {
        const price = listing.pricePerNight 
          ? `${listing.currency || '$'}${listing.pricePerNight}/night`
          : 'Contact host';
        return `${i + 1}. **${listing.title}**
   - Location: ${listing.city}, ${listing.country}
   - Type: ${listing.propertyType || 'Apartment'} | ${listing.bedrooms || 1} bedroom(s)
   - Price: ${price} | Max guests: ${listing.maxGuests || 2}
   - Rating: ${listing.averageRating ? `${listing.averageRating}/5` : 'New listing'}`;
      }).join('\n\n');

      return `MUNDO TANGO HOUSING (${housingResults.length} listings):

${housingSummary}

HOUSING FEATURES:
- Listings by tango dancers, for tango dancers
- Many have practice space or dance floors
- Hosts know the local tango scene`;
    } catch (error) {
      console.error('[Orchestrator] ❌ Housing query failed:', error);
      return 'Unable to fetch housing data at this time.';
    }
  }

  /**
   * MB.MD v9.4: Query travel plans from database
   */
  private async getTravelContext(message: string, eventId?: number): Promise<string> {
    try {
      const travelResults = await db.select({
        id: travelPlans.id,
        userId: travelPlans.userId,
        cityId: travelPlans.cityId,
        eventId: travelPlans.eventId,
        arrivalDate: travelPlans.arrivalDate,
        departureDate: travelPlans.departureDate,
        status: travelPlans.status,
      })
      .from(travelPlans)
      .where(eventId ? eq(travelPlans.eventId, eventId) : gte(travelPlans.arrivalDate, new Date()))
      .limit(20);

      if (travelResults.length === 0) {
        return 'No travel plans found. Be the first to share your travel dates!';
      }

      console.log(`[Orchestrator] ✈️ Found ${travelResults.length} travel plans`);

      return `TRAVELERS (${travelResults.length} plans):
${travelResults.map(t => 
  `- User ${t.userId}: ${t.arrivalDate ? new Date(t.arrivalDate).toLocaleDateString() : 'TBD'} to ${t.departureDate ? new Date(t.departureDate).toLocaleDateString() : 'TBD'}`
).join('\n')}

Connect with fellow travelers on the event page!`;
    } catch (error) {
      console.error('[Orchestrator] ❌ Travel query failed:', error);
      return 'Unable to fetch travel data at this time.';
    }
  }

  /**
   * MB.MD v9.3: Handle travel planning requests
   * Mark user as interested in event and create travel plan
   */
  async handleTravelPlanning(
    message: string,
    userId?: number
  ): Promise<{ action: string; eventId?: number; success: boolean; message: string }> {
    try {
      // Extract event reference from message
      const eventMatch = message.match(/(?:event|id)\s*[:#]?\s*(\d+)/i) ||
                        message.match(/go to\s+(.+?)(?:\s+event)?(?:\.|$)/i);
      
      if (!eventMatch) {
        return {
          action: 'clarify',
          success: false,
          message: 'Which event would you like to attend? Please specify the event name or ID.'
        };
      }

      // If user is not logged in
      if (!userId) {
        return {
          action: 'login_required',
          success: false,
          message: 'To mark events as interested or create travel plans, please log in first. Would you like me to guide you to the login page?'
        };
      }

      // For now, return guidance (actual RSVP creation would need event ID lookup)
      return {
        action: 'guide',
        success: true,
        message: `Great choice! To add this to your travel plans:
1. Visit the event page and click "Interested" or "Going"
2. You can then add travel dates from your profile
3. I can help you find housing and other events in that city!

Would you like me to show you more events in the same location?`
      };
    } catch (error) {
      console.error('[Orchestrator] ❌ Travel planning failed:', error);
      return {
        action: 'error',
        success: false,
        message: 'Unable to process travel planning request at this time.'
      };
    }
  }

  /**
   * Handle question intent - Use GROQ to generate answer (NO code)
   * MB.MD v9.2: Now CONTEXT-AWARE of current page, DOM elements, user intent
   * MB.MD v9.3: Now includes EVENTS DATABASE context for tango-related queries
   * Target: <2000ms
   */
  async handleQuestion(
    message: string,
    enrichedContext: EnrichedMessage,
    pageContext?: any
  ): Promise<QuestionResponse> {
    const startTime = Date.now();

    try {
      // Build context from RAG results
      let contextText = '';
      if (enrichedContext.contextChunks.length > 0) {
        contextText = enrichedContext.contextChunks
          .map((chunk, i) => `[Context ${i + 1}] ${chunk.content.substring(0, 500)}`)
          .join('\n\n');
      }

      // MB.MD v9.4: Add all database contexts based on question type
      let databaseContextText = '';
      const contextSources: string[] = [];
      
      // Events context
      if (this.isEventsQuestion(message)) {
        console.log('[Orchestrator] 📅 Detected events question - fetching events context');
        const eventsContext = await this.getEventsContext(message);
        databaseContextText += `\n\n${eventsContext}`;
        contextSources.push('events');
      }
      
      // Cities context
      if (this.isCityQuestion(message)) {
        console.log('[Orchestrator] 🏙️ Detected city question - fetching cities context');
        const citiesContext = await this.getCitiesContext(message);
        databaseContextText += `\n\n${citiesContext}`;
        contextSources.push('cities');
      }
      
      // Housing context
      if (this.isHousingQuestion(message)) {
        console.log('[Orchestrator] 🏠 Detected housing question - fetching housing context');
        const housingContext = await this.getHousingContext(message);
        databaseContextText += `\n\n${housingContext}`;
        contextSources.push('housing');
      }
      
      // Travelers context
      if (this.isTravelersQuestion(message)) {
        console.log('[Orchestrator] ✈️ Detected travelers question - fetching travel context');
        const travelContext = await this.getTravelContext(message);
        databaseContextText += `\n\n${travelContext}`;
        contextSources.push('travelers');
      }
      
      if (contextSources.length > 0) {
        console.log(`[Orchestrator] 📊 Database context loaded: ${contextSources.join(', ')}`);
      }

      // MB.MD v9.2 FIX: Build page awareness context
      let pageAwarenessText = '';
      if (pageContext) {
        const currentPage = pageContext.page || pageContext.currentPage || 'Unknown';
        const pageTitle = pageContext.pageTitle || 'Unknown';
        const userIntent = pageContext.userIntent || 'browsing';
        
        pageAwarenessText = `CURRENT PAGE CONTEXT:
- URL Path: ${currentPage}
- Page Title: ${pageTitle}
- User Intent: ${userIntent}`;

        // Add DOM snapshot if available
        if (pageContext.domSnapshot) {
          const { inputs, buttons, selects, errors } = pageContext.domSnapshot;
          pageAwarenessText += `
- Inputs on page: ${inputs?.length || 0}
- Buttons on page: ${buttons?.length || 0}
- Dropdowns on page: ${selects?.length || 0}
- Errors visible: ${errors?.length || 0}`;

          // Show specific DOM elements if present
          if (inputs && inputs.length > 0) {
            const inputDetails = inputs.slice(0, 3).map((inp: any) => 
              `  • ${inp.placeholder || inp.name || inp.testId || 'input'}`
            ).join('\n');
            pageAwarenessText += `\n\nKey inputs:\n${inputDetails}`;
          }

          if (errors && errors.length > 0) {
            const errorDetails = errors.map((err: any) => 
              `  • ${err.text}`
            ).join('\n');
            pageAwarenessText += `\n\nVisible errors:\n${errorDetails}`;
          }
        }
      }

      const systemPrompt = `You are Mr. Blue, the Mundo Tango AI assistant with FULL DATABASE ACCESS.

${pageAwarenessText}

CAPABILITIES:
✅ I can SEE the current page you're on
✅ I can SEE form fields, buttons, and errors
✅ I can VIBE CODE (generate/modify code with "can you vibe code?")
✅ I provide context-aware answers based on where you are
✅ I have FULL ACCESS to the Mundo Tango database:
   - 811 events (679 upcoming) in 15+ countries
   - 301 cities with community info
   - Housing listings for tango travelers
   - Travel plans to connect with fellow dancers
✅ I can search by: country, city, event type (marathon, encuentro, festival), date range

IMPORTANT: You are in QUESTION mode. Answer the user's question conversationally. DO NOT generate code unless explicitly asked.

${contextText ? `RELEVANT DOCUMENTATION:\n${contextText}\n\n` : ''}
${databaseContextText ? `\nDATABASE CONTEXT:${databaseContextText}\n\n` : ''}

GUIDELINES:
1. **Be specific**: When sharing events/cities, include dates, locations, and details
2. **Acknowledge the page context** if available
3. Answer questions clearly and concisely
4. If you don't know, say so - don't make things up
5. Keep responses conversational and helpful
6. For events: mention dates, location, type (marathon/encuentro/festival)
7. Encourage users to mark events as "Interested" or ask about housing
8. Offer to help with travel planning when relevant
9. Suggest related events/cities based on user interests`;
      
      console.log(`[Orchestrator] 🤖 System prompt ready. Database sources: ${contextSources.length > 0 ? contextSources.join(', ') : 'none'}`);

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const answer = response.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
      const duration = Date.now() - startTime;

      console.log(`[Orchestrator] ✅ Question handled in ${duration}ms`);

      return {
        success: true,
        mode: 'question',
        response: answer,
        sources: enrichedContext.contextChunks.map(c => c.source)
      };
    } catch (error) {
      console.error('[Orchestrator] ❌ Question handling failed:', error);
      return {
        success: true,
        mode: 'question',
        response: 'I apologize, I encountered an error processing your question. Please try again.',
        sources: []
      };
    }
  }

  /**
   * Handle action intent - Route to VibeCoding
   * Target: <3000ms (includes VibeCoding processing)
   */
  async handleActionRequest(
    message: string,
    context: any,
    userId: number = 0
  ): Promise<ActionResponse> {
    const startTime = Date.now();

    try {
      console.log('[Orchestrator] 🔨 Routing to VibeCoding service...');

      const sessionId = `action_${userId}_${Date.now()}`;

      const vibeRequest = {
        naturalLanguage: message,
        context: [
          `Current Page: ${context.currentPage || 'Unknown'}`,
          `Page Title: ${context.pageTitle || 'Unknown'}`,
          ...(context.domSnapshot ? [`DOM Snapshot: ${JSON.stringify(context.domSnapshot, null, 2)}`] : []),
        ],
        targetFiles: context.targetFiles || [],
        userId,
        sessionId,
      };

      const vibeCodingService = await getLazyVibeCodingService();
      const vibeResult = await vibeCodingService.generateCode(vibeRequest);

      const duration = Date.now() - startTime;
      console.log(`[Orchestrator] ✅ Action handled in ${duration}ms`);

      return {
        success: vibeResult.success,
        mode: 'action',
        vibecodingResult: vibeResult,
        requiresApproval: true,
      };
    } catch (error) {
      console.error('[Orchestrator] ❌ Action handling failed:', error);
      return {
        success: false,
        mode: 'action',
        vibecodingResult: null,
        requiresApproval: false,
      };
    }
  }

  /**
   * Analyze page: Activate → Audit → Self-Heal
   * Target: <1000ms (activation + audit), healing optional
   */
  async analyzePage(pageId: string, autoHeal: boolean = false): Promise<PageAnalysisResult> {
    const startTime = Date.now();

    try {
      console.log(`[Orchestrator] 🔍 Analyzing page: ${pageId}`);

      // Step 1: Activate agents
      const activation = await AgentActivationService.spinUpPageAgents(pageId);
      console.log(`[Orchestrator] ✅ Activated ${activation.totalAgents} agents in ${activation.activationTime}ms`);

      // Step 2: Run comprehensive audit
      const audit = await PageAuditService.runComprehensiveAudit(pageId);
      console.log(`[Orchestrator] ✅ Audit complete: ${audit.totalIssues} issues (${audit.criticalIssues} critical)`);

      let healing = undefined;

      // Step 3: Auto-heal if requested and issues found
      if (autoHeal && audit.hasIssues) {
        const healingResult = await SelfHealingService.executeSimultaneousFixes(audit);
        healing = {
          issuesFixed: healingResult.issuesFixed,
          healingDurationMs: healingResult.healingDurationMs,
          success: healingResult.success
        };
        console.log(`[Orchestrator] ✅ Self-healing complete: ${healingResult.issuesFixed} issues fixed`);
      }

      const totalTime = Date.now() - startTime;

      const result: PageAnalysisResult = {
        success: true,
        pageId,
        activation: {
          totalAgents: activation.totalAgents,
          activationTime: activation.activationTime
        },
        audit: {
          totalIssues: audit.totalIssues,
          criticalIssues: audit.criticalIssues,
          issuesByCategory: audit.issuesByCategory,
          auditDurationMs: audit.auditDurationMs
        },
        healing,
        totalTime
      };

      console.log(`[Orchestrator] ✅ Page analysis complete for ${pageId} in ${totalTime}ms`);

      return result;
    } catch (error) {
      console.error(`[Orchestrator] ❌ Page analysis failed for ${pageId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const conversationOrchestrator = new ConversationOrchestrator();
