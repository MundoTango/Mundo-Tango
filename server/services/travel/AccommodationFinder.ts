import axios from 'axios';
import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface AccommodationSearch {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  maxPrice?: number;
  amenities?: string[];
  type?: 'hotel' | 'hostel' | 'apartment' | 'any';
}

interface AccommodationResult {
  id: string;
  name: string;
  type: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    distanceToVenue?: number;
  };
  amenities: string[];
  images: string[];
  bookingUrl: string;
  availability: boolean;
  recommendation?: string;
}

interface GroupAccommodationSuggestion {
  properties: AccommodationResult[];
  totalCost: number;
  costPerPerson: number;
  savingsVsSeparate: number;
  suitabilityScore: number;
}

export class AccommodationFinder {
  private aiOrchestrator: RateLimitedAIOrchestrator;
  private serpApiKey: string;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
    this.serpApiKey = process.env.SERPAPI_API_KEY || '';
  }

  async searchAccommodations(search: AccommodationSearch): Promise<AccommodationResult[]> {
    if (!this.serpApiKey) {
      return this.getMockResults(search);
    }

    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google_hotels',
          q: `hotels in ${search.location}`,
          check_in_date: search.checkIn,
          check_out_date: search.checkOut,
          adults: search.guests,
          currency: 'USD',
          api_key: this.serpApiKey
        }
      });

      const results = response.data.properties || [];

      return results.slice(0, 20).map((hotel: any) => ({
        id: hotel.property_token || Math.random().toString(),
        name: hotel.name,
        type: hotel.type || 'hotel',
        price: hotel.rate_per_night?.lowest || 100,
        currency: 'USD',
        rating: hotel.overall_rating || 4.0,
        reviews: hotel.reviews || 0,
        location: {
          address: hotel.description || search.location,
          latitude: hotel.gps_coordinates?.latitude || 0,
          longitude: hotel.gps_coordinates?.longitude || 0
        },
        amenities: hotel.amenities || [],
        images: hotel.images?.map((img: any) => img.thumbnail) || [],
        bookingUrl: hotel.link || '',
        availability: true
      }));
    } catch (error) {
      console.error('SerpApi accommodation search error:', error);
      return this.getMockResults(search);
    }
  }

  async compareAcrossPlatforms(
    search: AccommodationSearch
  ): Promise<{
    results: AccommodationResult[];
    cheapest: AccommodationResult;
    bestRated: AccommodationResult;
    bestValue: AccommodationResult;
  }> {
    const results = await this.searchAccommodations(search);

    if (results.length === 0) {
      throw new Error('No accommodations found');
    }

    const cheapest = results.reduce((min, curr) => (curr.price < min.price ? curr : min));
    const bestRated = results.reduce((max, curr) => (curr.rating > max.rating ? curr : max));
    const bestValue = results.reduce((best, curr) => {
      const currValue = curr.rating / curr.price;
      const bestValue = best.rating / best.price;
      return currValue > bestValue ? curr : best;
    });

    return { results, cheapest, bestRated, bestValue };
  }

  async optimizeForEvent(
    eventLocation: { lat: number; lng: number; address: string },
    search: AccommodationSearch,
    preferences: {
      maxDistance?: number;
      nearPracticeSpaces?: boolean;
      requiresKitchen?: boolean;
    } = {}
  ): Promise<AccommodationResult[]> {
    const results = await this.searchAccommodations(search);

    const filtered = results.filter(result => {
      if (preferences.requiresKitchen && !result.amenities.some(a => a.toLowerCase().includes('kitchen'))) {
        return false;
      }

      const distance = this.calculateDistance(
        eventLocation.lat,
        eventLocation.lng,
        result.location.latitude,
        result.location.longitude
      );

      result.location.distanceToVenue = distance;

      if (preferences.maxDistance && distance > preferences.maxDistance) {
        return false;
      }

      return true;
    });

    const sorted = filtered.sort((a, b) => {
      const distA = a.location.distanceToVenue || 999;
      const distB = b.location.distanceToVenue || 999;
      return distA - distB;
    });

    for (const result of sorted.slice(0, 5)) {
      const prompt = `Why is this accommodation good for tango event attendees? ${result.name}, ${result.location.distanceToVenue?.toFixed(1)}km from venue, $${result.price}/night`;

      const response = await this.aiOrchestrator.smartRoute(
        { prompt, temperature: 0.7, maxTokens: 100 },
        { useCase: 'chat', priority: 'speed' }
      );

      result.recommendation = response.content.substring(0, 200);
    }

    return sorted;
  }

  async suggestGroupAccommodations(
    search: AccommodationSearch,
    groupSize: number
  ): Promise<GroupAccommodationSuggestion> {
    const results = await this.searchAccommodations({
      ...search,
      guests: groupSize,
      type: 'apartment'
    });

    const suitable = results.filter(r => r.amenities.some(a => a.toLowerCase().includes('bedroom')));

    const totalCost = suitable[0]?.price || 0;
    const costPerPerson = totalCost / groupSize;
    const separateCost = results[0]?.price || 100;
    const savingsVsSeparate = (separateCost * groupSize) - totalCost;

    return {
      properties: suitable.slice(0, 5),
      totalCost,
      costPerPerson,
      savingsVsSeparate,
      suitabilityScore: 85
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getMockResults(search: AccommodationSearch): AccommodationResult[] {
    return [
      {
        id: 'mock1',
        name: 'Tango Boutique Hotel',
        type: 'hotel',
        price: 120,
        currency: 'USD',
        rating: 4.5,
        reviews: 250,
        location: {
          address: search.location,
          latitude: 0,
          longitude: 0
        },
        amenities: ['WiFi', 'Breakfast', 'Dance floor'],
        images: [],
        bookingUrl: 'https://example.com/booking',
        availability: true
      },
      {
        id: 'mock2',
        name: 'Milonga Hostel',
        type: 'hostel',
        price: 45,
        currency: 'USD',
        rating: 4.2,
        reviews: 180,
        location: {
          address: search.location,
          latitude: 0,
          longitude: 0
        },
        amenities: ['WiFi', 'Kitchen', 'Common room'],
        images: [],
        bookingUrl: 'https://example.com/booking',
        availability: true
      },
      {
        id: 'mock3',
        name: 'Abrazo Apartments',
        type: 'apartment',
        price: 180,
        currency: 'USD',
        rating: 4.7,
        reviews: 95,
        location: {
          address: search.location,
          latitude: 0,
          longitude: 0
        },
        amenities: ['WiFi', 'Kitchen', 'Washer', '2 bedrooms'],
        images: [],
        bookingUrl: 'https://example.com/booking',
        availability: true
      }
    ];
  }
}

export const accommodationFinder = new AccommodationFinder();
