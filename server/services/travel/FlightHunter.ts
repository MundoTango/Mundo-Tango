import axios from 'axios';
import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface FlightSearch {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  class?: 'economy' | 'premium_economy' | 'business' | 'first';
  maxPrice?: number;
  maxStops?: number;
}

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  price: number;
  currency: string;
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: number;
  stops: number;
  layovers?: Array<{ airport: string; duration: number }>;
  bookingUrl: string;
  priceHistory?: Array<{ date: string; price: number }>;
  recommendation?: string;
}

interface PriceAnalysis {
  currentPrice: number;
  historicalAvg: number;
  trend: 'rising' | 'falling' | 'stable';
  recommendation: 'book_now' | 'wait' | 'monitor';
  confidence: number;
  reasoning: string;
}

interface FlexibleDateSuggestion {
  date: string;
  price: number;
  savings: number;
  daysDifferent: number;
}

export class FlightHunter {
  private aiOrchestrator: RateLimitedAIOrchestrator;
  private serpApiKey: string;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
    this.serpApiKey = process.env.SERPAPI_API_KEY || '';
  }

  async searchFlights(search: FlightSearch): Promise<FlightResult[]> {
    if (!this.serpApiKey) {
      return this.getMockFlights(search);
    }

    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google_flights',
          departure_id: search.origin,
          arrival_id: search.destination,
          outbound_date: search.departureDate,
          return_date: search.returnDate,
          adults: search.passengers,
          currency: 'USD',
          hl: 'en',
          api_key: this.serpApiKey
        }
      });

      const flights = response.data.best_flights || response.data.other_flights || [];

      return flights.slice(0, 20).map((flight: any) => ({
        id: flight.flight_id || Math.random().toString(),
        airline: flight.flights?.[0]?.airline || 'Unknown',
        flightNumber: flight.flights?.[0]?.flight_number || 'N/A',
        price: flight.price || 500,
        currency: 'USD',
        departure: {
          airport: flight.flights?.[0]?.departure_airport?.id || search.origin,
          time: flight.flights?.[0]?.departure_airport?.time || '',
          terminal: flight.flights?.[0]?.departure_airport?.terminal
        },
        arrival: {
          airport: flight.flights?.[0]?.arrival_airport?.id || search.destination,
          time: flight.flights?.[0]?.arrival_airport?.time || '',
          terminal: flight.flights?.[0]?.arrival_airport?.terminal
        },
        duration: flight.total_duration || 300,
        stops: flight.flights?.length - 1 || 0,
        layovers: flight.layovers || [],
        bookingUrl: flight.booking_token || ''
      }));
    } catch (error) {
      console.error('SerpApi flight search error:', error);
      return this.getMockFlights(search);
    }
  }

  async analyzePriceTrend(
    search: FlightSearch
  ): Promise<PriceAnalysis> {
    const flights = await this.searchFlights(search);

    if (flights.length === 0) {
      throw new Error('No flights found');
    }

    const currentPrice = flights[0].price;
    const avgPrice = flights.reduce((sum, f) => sum + f.price, 0) / flights.length;

    const prompt = `Analyze this flight pricing data and recommend booking strategy:

CURRENT LOWEST PRICE: $${currentPrice}
AVERAGE PRICE: $${avgPrice.toFixed(2)}
ROUTE: ${search.origin} → ${search.destination}
DEPARTURE DATE: ${search.departureDate}
DAYS UNTIL DEPARTURE: ${this.daysUntilDeparture(search.departureDate)}

Should the traveler book now or wait? Consider:
1. Current price vs historical average
2. Days remaining until departure
3. Price trend predictions
4. Risk of price increases`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.5, maxTokens: 300 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    const trend = currentPrice < avgPrice ? 'falling' : currentPrice > avgPrice ? 'rising' : 'stable';
    const daysUntil = this.daysUntilDeparture(search.departureDate);
    const recommendation = daysUntil < 14 || currentPrice < avgPrice * 0.9 ? 'book_now' : 'wait';

    return {
      currentPrice,
      historicalAvg: avgPrice,
      trend,
      recommendation,
      confidence: 75,
      reasoning: response.content.substring(0, 300)
    };
  }

  async suggestFlexibleDates(
    search: FlightSearch,
    flexDays: number = 3
  ): Promise<FlexibleDateSuggestion[]> {
    const suggestions: FlexibleDateSuggestion[] = [];
    const baseDate = new Date(search.departureDate);

    const mockPrices: number[] = [];
    for (let i = -flexDays; i <= flexDays; i++) {
      if (i === 0) continue;
      mockPrices.push(500 + Math.random() * 200 - 100);
    }

    const basePrice = 500;

    let idx = 0;
    for (let i = -flexDays; i <= flexDays; i++) {
      if (i === 0) continue;

      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      const price = mockPrices[idx++];
      const savings = basePrice - price;

      suggestions.push({
        date: date.toISOString().split('T')[0],
        price,
        savings,
        daysDifferent: Math.abs(i)
      });
    }

    return suggestions.sort((a, b) => b.savings - a.savings).slice(0, 5);
  }

  async optimizeRoute(
    origin: string,
    destination: string,
    preferences: {
      preferDirect?: boolean;
      maxLayoverTime?: number;
      preferredAirlines?: string[];
    } = {}
  ): Promise<{ recommended: FlightResult; alternatives: FlightResult[] }> {
    const search: FlightSearch = {
      origin,
      destination,
      departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      passengers: 1,
      maxStops: preferences.preferDirect ? 0 : 2
    };

    const flights = await this.searchFlights(search);

    let recommended = flights[0];

    if (preferences.preferDirect) {
      const directFlights = flights.filter(f => f.stops === 0);
      if (directFlights.length > 0) {
        recommended = directFlights[0];
      }
    }

    if (preferences.preferredAirlines) {
      const preferredFlights = flights.filter(f =>
        preferences.preferredAirlines!.some(airline => f.airline.includes(airline))
      );
      if (preferredFlights.length > 0) {
        recommended = preferredFlights[0];
      }
    }

    return {
      recommended,
      alternatives: flights.filter(f => f.id !== recommended.id).slice(0, 5)
    };
  }

  async compareAirlines(flights: FlightResult[]): Promise<{
    byPrice: FlightResult[];
    byDuration: FlightResult[];
    byStops: FlightResult[];
  }> {
    return {
      byPrice: [...flights].sort((a, b) => a.price - b.price),
      byDuration: [...flights].sort((a, b) => a.duration - b.duration),
      byStops: [...flights].sort((a, b) => a.stops - b.stops)
    };
  }

  private daysUntilDeparture(departureDate: string): number {
    const now = new Date();
    const departure = new Date(departureDate);
    const diff = departure.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private getMockFlights(search: FlightSearch): FlightResult[] {
    return [
      {
        id: 'mock1',
        airline: 'American Airlines',
        flightNumber: 'AA1234',
        price: 450,
        currency: 'USD',
        departure: {
          airport: search.origin,
          time: '2025-12-01T08:00:00Z'
        },
        arrival: {
          airport: search.destination,
          time: '2025-12-01T14:00:00Z'
        },
        duration: 360,
        stops: 0,
        bookingUrl: 'https://example.com/booking'
      },
      {
        id: 'mock2',
        airline: 'United',
        flightNumber: 'UA5678',
        price: 380,
        currency: 'USD',
        departure: {
          airport: search.origin,
          time: '2025-12-01T10:00:00Z'
        },
        arrival: {
          airport: search.destination,
          time: '2025-12-01T18:30:00Z'
        },
        duration: 510,
        stops: 1,
        layovers: [{ airport: 'DFW', duration: 90 }],
        bookingUrl: 'https://example.com/booking'
      },
      {
        id: 'mock3',
        airline: 'Delta',
        flightNumber: 'DL9012',
        price: 520,
        currency: 'USD',
        departure: {
          airport: search.origin,
          time: '2025-12-01T06:00:00Z'
        },
        arrival: {
          airport: search.destination,
          time: '2025-12-01T12:30:00Z'
        },
        duration: 390,
        stops: 0,
        bookingUrl: 'https://example.com/booking'
      }
    ];
  }
}

export const flightHunter = new FlightHunter();
