import { itineraryOptimizer } from './ItineraryOptimizer';
import { expenseOptimizer } from './ExpenseOptimizer';
import { travelMatcher } from './TravelMatcher';
import { accommodationFinder } from './AccommodationFinder';
import { flightHunter } from './FlightHunter';
import { localRecommendations } from './LocalRecommendations';

interface CompleteTripPlan {
  tripId: number;
  itinerary: any;
  expenses: any;
  companions: any[];
  accommodation: any;
  flights: any;
  localInfo: any;
  estimatedTotalCost: number;
  readinessScore: number;
}

export class TravelOrchestrator {
  async orchestrateCompleteTripPlanning(
    tripId: number,
    requirements: {
      destination: string;
      dates: { start: string; end: string };
      budget: number;
      travelers: number;
      activities: any[];
      preferences: any;
    }
  ): Promise<CompleteTripPlan> {
    const [
      itinerary,
      expenseAnalysis,
      accommodation,
      flights,
      localInfo
    ] = await Promise.all([
      itineraryOptimizer.optimizeItinerary(
        tripId,
        requirements.activities,
        requirements.dates,
        requirements.preferences
      ),
      expenseOptimizer.analyzeExpenses(tripId, [], requirements.budget),
      accommodationFinder.searchAccommodations({
        location: requirements.destination,
        checkIn: requirements.dates.start,
        checkOut: requirements.dates.end,
        guests: requirements.travelers
      }),
      flightHunter.searchFlights({
        origin: 'JFK',
        destination: requirements.destination,
        departureDate: requirements.dates.start,
        returnDate: requirements.dates.end,
        passengers: requirements.travelers
      }),
      localRecommendations.getRestaurants(requirements.destination)
    ]);

    const estimatedCost =
      (accommodation[0]?.price || 0) +
      (flights[0]?.price || 0) +
      requirements.budget;

    const readinessScore = this.calculateReadiness({
      hasItinerary: itinerary.optimizedDays.length > 0,
      hasAccommodation: accommodation.length > 0,
      hasFlights: flights.length > 0,
      withinBudget: estimatedCost <= requirements.budget * 1.2
    });

    return {
      tripId,
      itinerary,
      expenses: expenseAnalysis,
      companions: [],
      accommodation: accommodation[0],
      flights: flights[0],
      localInfo: { restaurants: localInfo },
      estimatedTotalCost: estimatedCost,
      readinessScore
    };
  }

  async optimizeExistingTrip(
    tripId: number,
    currentPlan: any
  ): Promise<{
    improvements: string[];
    savings: number;
    updatedPlan: any;
  }> {
    const improvements: string[] = [];
    let savings = 0;

    if (currentPlan.activities) {
      const optimized = await itineraryOptimizer.optimizeItinerary(
        tripId,
        currentPlan.activities,
        currentPlan.dates
      );

      if (optimized.efficiencyScore > 75) {
        improvements.push('Itinerary can be optimized for better time efficiency');
      }
    }

    if (currentPlan.expenses) {
      const analysis = await expenseOptimizer.analyzeExpenses(
        tripId,
        currentPlan.expenses,
        currentPlan.budget
      );

      if (analysis.savings.length > 0) {
        improvements.push(...analysis.savings);
        savings = 200;
      }
    }

    return {
      improvements,
      savings,
      updatedPlan: currentPlan
    };
  }

  async findTravelCompanions(
    userId: number,
    eventId: number,
    userProfile: any
  ): Promise<any[]> {
    const matches = await travelMatcher.findCompatibleTravelers(
      userProfile,
      []
    );

    return matches;
  }

  async getSmartRecommendations(
    destination: string,
    userPreferences: {
      interests: string[];
      budget: number;
      dietary?: string[];
    }
  ): Promise<{
    restaurants: any[];
    activities: any[];
    practiceSpaces: any[];
    safety: any;
  }> {
    const [restaurants, practiceSpaces, safety] = await Promise.all([
      localRecommendations.getRestaurants(destination, {
        dietary: userPreferences.dietary,
        priceLevel: userPreferences.budget > 1000 ? 3 : 2
      }),
      localRecommendations.findPracticeSpaces(destination),
      localRecommendations.getSafetyAdvisory(destination)
    ]);

    return {
      restaurants,
      activities: [],
      practiceSpaces,
      safety
    };
  }

  private calculateReadiness(checks: {
    hasItinerary: boolean;
    hasAccommodation: boolean;
    hasFlights: boolean;
    withinBudget: boolean;
  }): number {
    let score = 0;

    if (checks.hasItinerary) score += 25;
    if (checks.hasAccommodation) score += 30;
    if (checks.hasFlights) score += 30;
    if (checks.withinBudget) score += 15;

    return score;
  }
}

export const travelOrchestrator = new TravelOrchestrator();
