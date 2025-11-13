import { Worker, Job } from 'bullmq';
import { itineraryOptimizer } from '../services/travel/ItineraryOptimizer';
import { expenseOptimizer } from '../services/travel/ExpenseOptimizer';
import { travelMatcher } from '../services/travel/TravelMatcher';
import { accommodationFinder } from '../services/travel/AccommodationFinder';
import { flightHunter } from '../services/travel/FlightHunter';
import { localRecommendations } from '../services/travel/LocalRecommendations';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

interface TravelAgentJob {
  type:
    | 'optimize_itinerary'
    | 'optimize_expenses'
    | 'match_companions'
    | 'find_accommodation'
    | 'hunt_flights'
    | 'local_recommendations';
  data: any;
}

const worker = new Worker<TravelAgentJob>(
  'travel-agents',
  async (job: Job<TravelAgentJob>) => {
    console.log(`Processing travel agent job: ${job.data.type}`, job.id);

    try {
      switch (job.data.type) {
        case 'optimize_itinerary':
          return await itineraryOptimizer.optimizeItinerary(
            job.data.data.tripId,
            job.data.data.activities,
            job.data.data.dates,
            job.data.data.preferences
          );

        case 'optimize_expenses':
          return await expenseOptimizer.analyzeExpenses(
            job.data.data.tripId,
            job.data.data.expenses,
            job.data.data.totalBudget,
            job.data.data.currency
          );

        case 'match_companions':
          return await travelMatcher.findCompatibleTravelers(
            job.data.data.userProfile,
            job.data.data.candidates,
            job.data.data.options
          );

        case 'find_accommodation':
          return await accommodationFinder.searchAccommodations(job.data.data.search);

        case 'hunt_flights':
          return await flightHunter.searchFlights(job.data.data.search);

        case 'local_recommendations':
          return await localRecommendations.getRestaurants(
            job.data.data.location,
            job.data.data.preferences
          );

        default:
          throw new Error(`Unknown job type: ${job.data.type}`);
      }
    } catch (error: any) {
      console.error(`Travel agent job failed:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5
  }
);

worker.on('completed', (job) => {
  console.log(`Travel agent job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Travel agent job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Travel agent worker error:', err);
});

export default worker;
