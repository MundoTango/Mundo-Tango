import axios from 'axios';
import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface LocalRecommendation {
  name: string;
  category: 'restaurant' | 'practice_space' | 'sightseeing' | 'emergency' | 'transport' | 'event';
  address: string;
  rating?: number;
  priceLevel?: number;
  hours?: string;
  description: string;
  distance?: number;
  recommendations?: string;
  specialFeatures?: string[];
}

interface SafetyAdvisory {
  level: 'low' | 'medium' | 'high';
  warnings: string[];
  safePractices: string[];
  emergencyContacts: Array<{ service: string; number: string }>;
}

export class LocalRecommendations {
  private aiOrchestrator: RateLimitedAIOrchestrator;
  private serpApiKey: string;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
    this.serpApiKey = process.env.SERPAPI_API_KEY || '';
  }

  async getRestaurants(
    location: string,
    preferences: {
      cuisine?: string;
      dietary?: string[];
      priceLevel?: number;
      radius?: number;
    } = {}
  ): Promise<LocalRecommendation[]> {
    const { cuisine = 'local', dietary = [], priceLevel = 2 } = preferences;

    if (!this.serpApiKey) {
      return this.getMockRestaurants(location, cuisine);
    }

    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google_maps',
          q: `${cuisine} restaurants in ${location}`,
          type: 'search',
          api_key: this.serpApiKey
        }
      });

      const places = response.data.local_results || [];

      return places.slice(0, 10).map((place: any) => ({
        name: place.title,
        category: 'restaurant' as const,
        address: place.address || location,
        rating: place.rating,
        priceLevel: place.price || priceLevel,
        hours: place.hours,
        description: place.description || `${cuisine} restaurant`,
        specialFeatures: dietary
      }));
    } catch (error) {
      console.error('SerpApi restaurant search error:', error);
      return this.getMockRestaurants(location, cuisine);
    }
  }

  async findPracticeSpaces(
    location: string,
    requirements: {
      type?: 'studio' | 'milonga' | 'any';
      size?: number;
      hasFloor?: boolean;
    } = {}
  ): Promise<LocalRecommendation[]> {
    const { type = 'any' } = requirements;

    const prompt = `Find tango practice spaces and milongas in ${location}. List:
1. Dance studios with practice space availability
2. Regular milongas and practicas
3. Community centers with dance floors
4. Informal practice locations

For each, include name, address, typical hours, and why it's good for tango practice.`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.7, maxTokens: 1000 },
      { useCase: 'chat', priority: 'quality' }
    );

    return this.parsePracticeSpaces(response.content, location);
  }

  async getSightseeing(
    location: string,
    interests: string[] = [],
    duration: number = 2
  ): Promise<LocalRecommendation[]> {
    const prompt = `Recommend top sightseeing spots in ${location} for travelers interested in ${interests.join(', ') || 'general tourism'}.

Consider:
- Travel time from city center
- Entry costs
- Best times to visit
- Why tango dancers might enjoy it
- Estimated visit duration

Provide ${duration}-hour itinerary worth of activities.`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.7, maxTokens: 1200 },
      { useCase: 'chat', priority: 'quality' }
    );

    return this.parseSightseeing(response.content, location);
  }

  async getEmergencyServices(
    location: string
  ): Promise<LocalRecommendation[]> {
    const prompt = `List essential emergency services in ${location}:
1. Hospitals and medical clinics (24/7)
2. Police stations
3. Embassy/consulate contacts
4. Emergency phone numbers
5. Pharmacies (24/7)

For each, provide exact address and contact information.`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.3, maxTokens: 800 },
      { useCase: 'chat', priority: 'quality' }
    );

    return this.parseEmergencyServices(response.content, location);
  }

  async getTransportOptions(
    location: string,
    from?: string,
    to?: string
  ): Promise<LocalRecommendation[]> {
    const prompt = from && to
      ? `Best ways to get from ${from} to ${to} in ${location}? Include:
         - Public transit (metro, bus)
         - Ride-sharing (Uber, Lyft, local apps)
         - Taxi services
         - Walking/biking options
         Provide costs, typical duration, and safety tips.`
      : `Overview of transportation in ${location}:
         - Public transit system
         - Ride-sharing availability
         - Taxi services
         - Transportation apps
         - Tourist passes`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 1000 },
      { useCase: 'chat', priority: 'quality' }
    );

    return this.parseTransport(response.content, location);
  }

  async discoverLocalEvents(
    location: string,
    dateRange: { start: string; end: string },
    eventType?: string
  ): Promise<LocalRecommendation[]> {
    const prompt = `What tango and cultural events are happening in ${location} from ${dateRange.start} to ${dateRange.end}?

Include:
- Milongas and tango events
- Festivals
- Live music
- Cultural performances
- Dance workshops

For each event, provide date, time, venue, entry cost, and why it's worth attending.`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.7, maxTokens: 1500 },
      { useCase: 'chat', priority: 'quality' }
    );

    return this.parseEvents(response.content, location);
  }

  async getSafetyAdvisory(location: string): Promise<SafetyAdvisory> {
    const prompt = `Provide safety advisory for ${location} for international travelers:
1. Current safety level (low/medium/high risk)
2. Areas to avoid
3. Common scams targeting tourists
4. Safe travel practices
5. Emergency contact numbers`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.4, maxTokens: 1000 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    return this.parseSafetyAdvisory(response.content);
  }

  private getMockRestaurants(location: string, cuisine: string): LocalRecommendation[] {
    return [
      {
        name: `La Casa de ${cuisine}`,
        category: 'restaurant',
        address: `123 Main St, ${location}`,
        rating: 4.5,
        priceLevel: 2,
        hours: '11:00 AM - 10:00 PM',
        description: `Authentic ${cuisine} cuisine in the heart of ${location}`,
        specialFeatures: ['Vegetarian options', 'Outdoor seating']
      },
      {
        name: 'El Rincón Tanguero',
        category: 'restaurant',
        address: `456 Dance Ave, ${location}`,
        rating: 4.7,
        priceLevel: 3,
        hours: '6:00 PM - 12:00 AM',
        description: 'Traditional Argentine steakhouse with live tango shows',
        specialFeatures: ['Live music', 'Tango performances']
      }
    ];
  }

  private parsePracticeSpaces(content: string, location: string): LocalRecommendation[] {
    const lines = content.split('\n').filter(l => l.trim());
    const spaces: LocalRecommendation[] = [];

    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      if (lines[i].includes('-') || lines[i].match(/\d\./)) {
        spaces.push({
          name: `Practice Space ${i + 1}`,
          category: 'practice_space',
          address: location,
          description: lines[i].replace(/^[-\d.]\s*/, '').trim(),
          specialFeatures: ['Dance floor', 'Sound system']
        });
      }
    }

    if (spaces.length === 0) {
      spaces.push({
        name: 'Tango Studio Central',
        category: 'practice_space',
        address: `789 Dance Blvd, ${location}`,
        description: 'Professional dance studio with wooden floors and mirrors',
        specialFeatures: ['Wooden floor', 'Mirrors', 'Sound system', 'Air conditioning']
      });
    }

    return spaces;
  }

  private parseSightseeing(content: string, location: string): LocalRecommendation[] {
    const attractions: LocalRecommendation[] = [];
    const lines = content.split('\n').filter(l => l.trim());

    for (const line of lines.slice(0, 5)) {
      if (line.includes('-') || line.match(/\d\./)) {
        attractions.push({
          name: line.substring(0, 50),
          category: 'sightseeing',
          address: location,
          description: line.replace(/^[-\d.]\s*/, '').trim()
        });
      }
    }

    if (attractions.length === 0) {
      attractions.push({
        name: 'Historic City Center',
        category: 'sightseeing',
        address: location,
        description: 'Beautiful historic architecture and cultural landmarks'
      });
    }

    return attractions;
  }

  private parseEmergencyServices(content: string, location: string): LocalRecommendation[] {
    return [
      {
        name: 'Emergency Services',
        category: 'emergency',
        address: location,
        description: content.substring(0, 500),
        specialFeatures: ['24/7', 'English speaking staff']
      }
    ];
  }

  private parseTransport(content: string, location: string): LocalRecommendation[] {
    return [
      {
        name: 'Public Transportation',
        category: 'transport',
        address: location,
        description: content.substring(0, 500)
      }
    ];
  }

  private parseEvents(content: string, location: string): LocalRecommendation[] {
    const events: LocalRecommendation[] = [];
    const lines = content.split('\n').filter(l => l.trim());

    for (const line of lines.slice(0, 5)) {
      if (line.includes('-') || line.match(/\d\./)) {
        events.push({
          name: line.substring(0, 50),
          category: 'event',
          address: location,
          description: line.replace(/^[-\d.]\s*/, '').trim()
        });
      }
    }

    return events;
  }

  private parseSafetyAdvisory(content: string): SafetyAdvisory {
    const level: 'low' | 'medium' | 'high' = content.toLowerCase().includes('high risk')
      ? 'high'
      : content.toLowerCase().includes('medium')
      ? 'medium'
      : 'low';

    return {
      level,
      warnings: ['Stay aware of surroundings', 'Avoid displaying valuables'],
      safePractices: ['Use official taxis', 'Keep copies of documents', 'Share itinerary with contacts'],
      emergencyContacts: [
        { service: 'Police', number: '911' },
        { service: 'Ambulance', number: '911' },
        { service: 'US Embassy', number: '+1-xxx-xxx-xxxx' }
      ]
    };
  }
}

export const localRecommendations = new LocalRecommendations();
