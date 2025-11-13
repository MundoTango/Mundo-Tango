import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface Activity {
  id: number;
  name: string;
  location: { lat: number; lng: number; address: string };
  duration: number;
  energyLevel: 'low' | 'medium' | 'high';
  priority: 'must' | 'should' | 'nice';
  timePreference?: 'morning' | 'afternoon' | 'evening';
}

interface ItineraryDay {
  date: string;
  activities: Array<Activity & { startTime: string; endTime: string }>;
  travelTime: number;
  energyBalance: number;
}

interface OptimizationResult {
  optimizedDays: ItineraryDay[];
  improvements: string[];
  warnings: string[];
  totalTravelTime: number;
  efficiencyScore: number;
}

export class ItineraryOptimizer {
  private aiOrchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
  }

  async optimizeItinerary(
    tripId: number,
    activities: Activity[],
    dates: { start: string; end: string },
    preferences: {
      maxDailyActivities?: number;
      preferredPace?: 'relaxed' | 'moderate' | 'packed';
      prioritizeTravel?: boolean;
    } = {}
  ): Promise<OptimizationResult> {
    const {
      maxDailyActivities = 4,
      preferredPace = 'moderate',
      prioritizeTravel = true
    } = preferences;

    const prompt = `You are an expert travel itinerary optimizer. Analyze these activities and create an optimal daily schedule.

ACTIVITIES:
${activities.map(a => `- ${a.name} (${a.energyLevel} energy, ${a.priority} priority, ${a.duration}min, Location: ${a.location.address})`).join('\n')}

DATE RANGE: ${dates.start} to ${dates.end}
PREFERENCES:
- Max ${maxDailyActivities} activities per day
- Pace: ${preferredPace}
- Travel optimization: ${prioritizeTravel ? 'minimize travel time' : 'flexible'}

Create an optimized schedule that:
1. Minimizes travel time between activities
2. Balances energy levels (don't stack all high-energy activities)
3. Respects time preferences (morning/afternoon/evening)
4. Prioritizes must-do activities
5. Accounts for realistic travel and break times
6. Avoids scheduling conflicts
7. Suggests realistic time slots

Return a detailed day-by-day itinerary with:
- Specific time slots for each activity
- Estimated travel time between locations
- Energy balance recommendations
- Potential improvements or warnings`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.7, maxTokens: 2000 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    const parsed = this.parseAIResponse(response.content, activities, dates);

    return {
      ...parsed,
      efficiencyScore: this.calculateEfficiency(parsed.optimizedDays)
    };
  }

  async optimizeWithMaps(activities: Activity[]): Promise<{
    sortedActivities: Activity[];
    totalDistance: number;
    totalTime: number;
  }> {
    const sorted = [...activities].sort((a, b) => {
      const distA = Math.sqrt(
        Math.pow(a.location.lat, 2) + Math.pow(a.location.lng, 2)
      );
      const distB = Math.sqrt(
        Math.pow(b.location.lat, 2) + Math.pow(b.location.lng, 2)
      );
      return distA - distB;
    });

    return {
      sortedActivities: sorted,
      totalDistance: 0,
      totalTime: 0
    };
  }

  async balanceEnergyLevels(day: ItineraryDay): Promise<{
    balanced: boolean;
    score: number;
    suggestions: string[];
  }> {
    const energyLevels = day.activities.map(a => a.energyLevel);
    const highEnergyCount = energyLevels.filter(e => e === 'high').length;
    const totalActivities = energyLevels.length;

    const isBalanced = highEnergyCount <= totalActivities / 2;
    const score = isBalanced ? 85 : 60;

    const suggestions = [];
    if (!isBalanced) {
      suggestions.push('Consider spreading high-energy activities across different days');
      suggestions.push('Add rest periods between intense activities');
    }

    return { balanced: isBalanced, score, suggestions };
  }

  private parseAIResponse(
    content: string,
    activities: Activity[],
    dates: { start: string; end: string }
  ): Omit<OptimizationResult, 'efficiencyScore'> {
    const days: ItineraryDay[] = [];
    const improvements: string[] = [];
    const warnings: string[] = [];

    const lines = content.split('\n');
    let currentDay: ItineraryDay | null = null;
    let totalTravelTime = 0;

    for (const line of lines) {
      if (line.match(/DAY \d+|Day \d+/i)) {
        if (currentDay) days.push(currentDay);
        currentDay = {
          date: dates.start,
          activities: [],
          travelTime: 0,
          energyBalance: 0
        };
      }

      if (line.includes('improvement') || line.includes('optimize')) {
        improvements.push(line.trim());
      }

      if (line.includes('warning') || line.includes('caution')) {
        warnings.push(line.trim());
      }
    }

    if (currentDay) days.push(currentDay);

    if (days.length === 0) {
      days.push({
        date: dates.start,
        activities: activities.slice(0, 3).map((a, i) => ({
          ...a,
          startTime: `${9 + i * 3}:00`,
          endTime: `${9 + i * 3 + Math.floor(a.duration / 60)}:${a.duration % 60}`
        })),
        travelTime: 60,
        energyBalance: 50
      });
    }

    return { optimizedDays: days, improvements, warnings, totalTravelTime };
  }

  private calculateEfficiency(days: ItineraryDay[]): number {
    if (days.length === 0) return 0;

    const totalActivities = days.reduce((sum, day) => sum + day.activities.length, 0);
    const avgActivitiesPerDay = totalActivities / days.length;
    const avgTravelTime = days.reduce((sum, day) => sum + day.travelTime, 0) / days.length;

    const activityScore = Math.min((avgActivitiesPerDay / 4) * 100, 100);
    const travelScore = Math.max(100 - (avgTravelTime / 60) * 20, 0);

    return Math.round((activityScore + travelScore) / 2);
  }
}

export const itineraryOptimizer = new ItineraryOptimizer();
