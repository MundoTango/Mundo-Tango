import { Router, Request, Response } from 'express';
import { itineraryOptimizer } from '../services/travel/ItineraryOptimizer';
import { expenseOptimizer } from '../services/travel/ExpenseOptimizer';
import { travelMatcher } from '../services/travel/TravelMatcher';
import { accommodationFinder } from '../services/travel/AccommodationFinder';
import { flightHunter } from '../services/travel/FlightHunter';
import { localRecommendations } from '../services/travel/LocalRecommendations';
import { travelOrchestrator } from '../services/travel/TravelOrchestrator';

const router = Router();

router.post('/optimize-itinerary', async (req: Request, res: Response) => {
  try {
    const { tripId, activities, dates, preferences } = req.body;

    const result = await itineraryOptimizer.optimizeItinerary(
      tripId,
      activities,
      dates,
      preferences
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Itinerary optimization error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/optimize-expenses', async (req: Request, res: Response) => {
  try {
    const { tripId, expenses, totalBudget, currency } = req.body;

    const result = await expenseOptimizer.analyzeExpenses(
      tripId,
      expenses,
      totalBudget,
      currency
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Expense optimization error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/match-companions', async (req: Request, res: Response) => {
  try {
    const { userProfile, candidates, options } = req.body;

    const result = await travelMatcher.findCompatibleTravelers(
      userProfile,
      candidates,
      options
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Companion matching error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/find-accommodation', async (req: Request, res: Response) => {
  try {
    const search = req.body;

    const results = await accommodationFinder.searchAccommodations(search);

    const comparison = await accommodationFinder.compareAcrossPlatforms(search);

    res.json({
      success: true,
      data: {
        results,
        cheapest: comparison.cheapest,
        bestRated: comparison.bestRated,
        bestValue: comparison.bestValue
      }
    });
  } catch (error: any) {
    console.error('Accommodation search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/hunt-flights', async (req: Request, res: Response) => {
  try {
    const search = req.body;

    const [flights, priceAnalysis, flexibleDates] = await Promise.all([
      flightHunter.searchFlights(search),
      flightHunter.analyzePriceTrend(search),
      flightHunter.suggestFlexibleDates(search, 3)
    ]);

    res.json({
      success: true,
      data: {
        flights,
        priceAnalysis,
        flexibleDates
      }
    });
  } catch (error: any) {
    console.error('Flight search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/local-recommendations/:location', async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const { type, ...preferences } = req.query;

    let results;

    switch (type) {
      case 'restaurants':
        results = await localRecommendations.getRestaurants(location, preferences as any);
        break;
      case 'practice-spaces':
        results = await localRecommendations.findPracticeSpaces(location, preferences as any);
        break;
      case 'sightseeing':
        results = await localRecommendations.getSightseeing(location, [], 2);
        break;
      case 'emergency':
        results = await localRecommendations.getEmergencyServices(location);
        break;
      case 'transport':
        results = await localRecommendations.getTransportOptions(location);
        break;
      case 'safety':
        results = await localRecommendations.getSafetyAdvisory(location);
        break;
      default:
        results = await localRecommendations.getRestaurants(location);
    }

    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Local recommendations error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orchestrate-trip', async (req: Request, res: Response) => {
  try {
    const { tripId, requirements } = req.body;

    const result = await travelOrchestrator.orchestrateCompleteTripPlanning(
      tripId,
      requirements
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Trip orchestration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/optimize-trip', async (req: Request, res: Response) => {
  try {
    const { tripId, currentPlan } = req.body;

    const result = await travelOrchestrator.optimizeExistingTrip(tripId, currentPlan);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Trip optimization error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
