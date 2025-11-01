/**
 * A3: Event Recommendation Agent
 * 
 * Suggests relevant events based on distance, interests, friend attendance,
 * historical patterns, and time slot availability
 */

export interface EventRecommendation {
  eventId: number;
  score: number;
  reasons: string[];
  distanceKm?: number;
  friendsAttending: number;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  date: Date;
  latitude?: number;
  longitude?: number;
  attendeeCount?: number;
  categories?: string[];
}

interface UserProfile {
  id: number;
  latitude?: number;
  longitude?: number;
  interests: string[];
  friends: number[];
  pastEventIds: number[];
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Score event based on distance
 * Closer events get higher scores
 */
function calculateProximityScore(distanceKm: number | null): number {
  if (distanceKm === null) return 0.5; // Neutral if no location data
  
  // Exponential decay: perfect score at 0km, 0.5 at 25km, near 0 at 100km
  return Math.exp(-distanceKm / 25);
}

/**
 * Score event based on interest matching
 * More matching interests = higher score
 */
function calculateInterestScore(
  event: Event,
  userInterests: string[]
): number {
  if (!event.categories || event.categories.length === 0) return 0.5;
  
  const matchingInterests = event.categories.filter(category =>
    userInterests.some(interest => 
      interest.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(interest.toLowerCase())
    )
  );
  
  const matchRatio = matchingInterests.length / Math.max(event.categories.length, userInterests.length);
  return Math.min(1, matchRatio * 1.5); // Boost matches
}

/**
 * Score based on friend attendance
 * Social proof: events friends are attending get boosted
 */
function calculateFriendScore(
  friendsAttending: number,
  totalFriends: number
): number {
  if (totalFriends === 0) return 0.5;
  
  const attendanceRatio = friendsAttending / totalFriends;
  // Logarithmic scale to prevent overwhelming influence
  return Math.min(1, Math.log1p(friendsAttending * 10) / Math.log1p(totalFriends * 10));
}

/**
 * Score based on historical attendance patterns
 * Similar events attended in the past boost recommendation
 */
function calculateHistoricalScore(
  event: Event,
  pastEventIds: number[],
  allEvents: Event[]
): number {
  if (pastEventIds.length === 0) return 0.5;
  
  // Check if user attended similar events
  const pastEvents = allEvents.filter(e => pastEventIds.includes(e.id));
  const similarPastEvents = pastEvents.filter(past => {
    if (!event.categories || !past.categories) return false;
    
    return past.categories.some(cat => 
      event.categories!.includes(cat)
    );
  });
  
  return Math.min(1, similarPastEvents.length / 3); // Cap at 3 similar events
}

/**
 * Score based on event popularity
 * More attendees = more appealing (with diminishing returns)
 */
function calculatePopularityScore(attendeeCount?: number): number {
  if (!attendeeCount) return 0.5;
  
  // Logarithmic scale: 10 attendees = 0.5, 100 = 0.75, 1000 = 0.9
  return Math.min(1, Math.log1p(attendeeCount) / Math.log1p(1000));
}

/**
 * Main recommendation function
 * Combines all factors to score events for a user
 */
export function recommendEvents(
  user: UserProfile,
  events: Event[],
  eventAttendees: Map<number, Set<number>>, // eventId -> Set of attendee userIds
  options: {
    maxDistance?: number; // Filter out events beyond this distance (km)
    limit?: number;
    minScore?: number;
  } = {}
): EventRecommendation[] {
  const {
    maxDistance = 100,
    limit = 20,
    minScore = 0.3
  } = options;
  
  const recommendations: EventRecommendation[] = [];
  
  for (const event of events) {
    const reasons: string[] = [];
    
    // Calculate distance
    const distanceKm = calculateDistance(
      user.latitude,
      user.longitude,
      event.latitude,
      event.longitude
    );
    
    // Filter by max distance
    if (distanceKm !== null && distanceKm > maxDistance) {
      continue;
    }
    
    // Check friend attendance
    const attendees = eventAttendees.get(event.id) || new Set();
    const friendsAttending = user.friends.filter(friendId => 
      attendees.has(friendId)
    ).length;
    
    // Calculate component scores
    const proximityScore = calculateProximityScore(distanceKm);
    const interestScore = calculateInterestScore(event, user.interests);
    const friendScore = calculateFriendScore(friendsAttending, user.friends.length);
    const historicalScore = calculateHistoricalScore(event, user.pastEventIds, events);
    const popularityScore = calculatePopularityScore(event.attendeeCount);
    
    // Weighted combination
    const DISTANCE_WEIGHT = 0.25;
    const INTEREST_WEIGHT = 0.30;
    const FRIEND_WEIGHT = 0.25;
    const HISTORY_WEIGHT = 0.15;
    const POPULARITY_WEIGHT = 0.05;
    
    const finalScore = 
      (DISTANCE_WEIGHT * proximityScore) +
      (INTEREST_WEIGHT * interestScore) +
      (FRIEND_WEIGHT * friendScore) +
      (HISTORY_WEIGHT * historicalScore) +
      (POPULARITY_WEIGHT * popularityScore);
    
    // Build reasons list
    if (distanceKm !== null && distanceKm < 10) {
      reasons.push(`Only ${distanceKm.toFixed(1)}km away`);
    }
    if (friendsAttending > 0) {
      reasons.push(`${friendsAttending} friend${friendsAttending > 1 ? 's' : ''} attending`);
    }
    if (interestScore > 0.7) {
      reasons.push('Matches your interests');
    }
    if (historicalScore > 0.5) {
      reasons.push('Similar to events you\'ve attended');
    }
    if (event.attendeeCount && event.attendeeCount > 50) {
      reasons.push('Popular event');
    }
    
    // Only include if meets minimum score
    if (finalScore >= minScore) {
      recommendations.push({
        eventId: event.id,
        score: finalScore,
        reasons,
        distanceKm: distanceKm || undefined,
        friendsAttending
      });
    }
  }
  
  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);
  
  // Apply limit
  return recommendations.slice(0, limit);
}
