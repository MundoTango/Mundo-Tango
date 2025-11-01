/**
 * A1: User Recommendation Agent
 * 
 * Suggests users to follow based on mutual connections, shared interests,
 * geographic proximity, and activity level
 */

export interface UserRecommendation {
  userId: number;
  score: number;
  reasons: string[];
  mutualFriends: number;
  sharedInterests: number;
  distanceKm?: number;
}

interface UserForRecommendation {
  id: number;
  interests: string[];
  friends: number[];
  cityName?: string;
  latitude?: number;
  longitude?: number;
  postsCount?: number;
  lastActiveAt?: Date;
}

/**
 * Calculate Haversine distance between coordinates
 */
function calculateDistance(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371;
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
 * Calculate similarity based on mutual connections
 * Collaborative filtering approach
 */
function calculateConnectionSimilarity(
  currentUserFriends: number[],
  candidateFriends: number[]
): { score: number; mutualCount: number } {
  const currentSet = new Set(currentUserFriends);
  const candidateSet = new Set(candidateFriends);
  
  // Count mutual friends
  const mutualFriends = currentUserFriends.filter(id => candidateSet.has(id));
  const mutualCount = mutualFriends.length;
  
  // Jaccard similarity: intersection / union
  const totalUnique = new Set([...currentUserFriends, ...candidateFriends]).size;
  const jaccardScore = totalUnique > 0 ? mutualCount / totalUnique : 0;
  
  return {
    score: jaccardScore,
    mutualCount
  };
}

/**
 * Calculate similarity based on shared interests
 */
function calculateInterestSimilarity(
  currentUserInterests: string[],
  candidateInterests: string[]
): { score: number; sharedCount: number } {
  if (currentUserInterests.length === 0 || candidateInterests.length === 0) {
    return { score: 0, sharedCount: 0 };
  }
  
  // Normalize interests (lowercase for comparison)
  const currentSet = new Set(currentUserInterests.map(i => i.toLowerCase()));
  const candidateSet = new Set(candidateInterests.map(i => i.toLowerCase()));
  
  // Count shared interests
  const shared = currentUserInterests.filter(interest => 
    candidateSet.has(interest.toLowerCase())
  );
  const sharedCount = shared.length;
  
  // Jaccard similarity
  const totalUnique = new Set([
    ...Array.from(currentSet), 
    ...Array.from(candidateSet)
  ]).size;
  
  const jaccardScore = totalUnique > 0 ? sharedCount / totalUnique : 0;
  
  return {
    score: jaccardScore,
    sharedCount
  };
}

/**
 * Score based on geographic proximity
 */
function calculateProximityScore(
  distanceKm: number | null,
  sameCity: boolean
): number {
  if (sameCity) return 0.8; // Strong boost for same city
  if (distanceKm === null) return 0.3; // Neutral if no location data
  
  // Exponential decay: 1.0 at 0km, 0.5 at 50km, near 0 at 200km
  return Math.exp(-distanceKm / 50);
}

/**
 * Score based on user activity level
 * More active users are better recommendations
 */
function calculateActivityScore(
  postsCount: number = 0,
  lastActiveAt?: Date
): number {
  // Posts score (logarithmic to prevent outliers)
  const postsScore = Math.min(1, Math.log1p(postsCount) / Math.log1p(100));
  
  // Recency score
  let recencyScore = 0.5;
  if (lastActiveAt) {
    const daysSinceActive = (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
    recencyScore = daysSinceActive < 7 ? 1.0 
      : daysSinceActive < 30 ? 0.7 
      : daysSinceActive < 90 ? 0.4 
      : 0.2;
  }
  
  return (postsScore * 0.4) + (recencyScore * 0.6);
}

/**
 * Main user recommendation function
 * Returns ranked list of suggested users to follow
 */
export function recommendUsers(
  currentUser: UserForRecommendation,
  allUsers: UserForRecommendation[],
  options: {
    excludeUserIds?: number[];
    maxDistance?: number;
    limit?: number;
    minScore?: number;
  } = {}
): UserRecommendation[] {
  const {
    excludeUserIds = [],
    maxDistance = 500,
    limit = 20,
    minScore = 0.2
  } = options;
  
  const recommendations: UserRecommendation[] = [];
  const alreadyFollowing = new Set([...currentUser.friends, ...excludeUserIds, currentUser.id]);
  
  for (const candidate of allUsers) {
    // Skip if already following or in exclude list
    if (alreadyFollowing.has(candidate.id)) continue;
    
    const reasons: string[] = [];
    
    // Calculate mutual connections
    const connectionSim = calculateConnectionSimilarity(
      currentUser.friends,
      candidate.friends
    );
    
    // Calculate shared interests
    const interestSim = calculateInterestSimilarity(
      currentUser.interests,
      candidate.interests
    );
    
    // Calculate geographic proximity
    const sameCity = currentUser.cityName === candidate.cityName && !!currentUser.cityName;
    const distanceKm = calculateDistance(
      currentUser.latitude,
      currentUser.longitude,
      candidate.latitude,
      candidate.longitude
    );
    
    // Filter by max distance if specified
    if (distanceKm !== null && distanceKm > maxDistance) {
      continue;
    }
    
    const proximityScore = calculateProximityScore(distanceKm, sameCity);
    
    // Calculate activity score
    const activityScore = calculateActivityScore(
      candidate.postsCount,
      candidate.lastActiveAt
    );
    
    // Weighted combination (as per spec: 40% connections, 30% interests, 20% proximity, 10% activity)
    const MUTUAL_WEIGHT = 0.40;
    const INTEREST_WEIGHT = 0.30;
    const PROXIMITY_WEIGHT = 0.20;
    const ACTIVITY_WEIGHT = 0.10;
    
    const finalScore = 
      (MUTUAL_WEIGHT * connectionSim.score) +
      (INTEREST_WEIGHT * interestSim.score) +
      (PROXIMITY_WEIGHT * proximityScore) +
      (ACTIVITY_WEIGHT * activityScore);
    
    // Build reasons list
    if (connectionSim.mutualCount > 0) {
      reasons.push(`${connectionSim.mutualCount} mutual friend${connectionSim.mutualCount > 1 ? 's' : ''}`);
    }
    if (interestSim.sharedCount > 0) {
      reasons.push(`${interestSim.sharedCount} shared interest${interestSim.sharedCount > 1 ? 's' : ''}`);
    }
    if (sameCity) {
      reasons.push(`In your city`);
    } else if (distanceKm !== null && distanceKm < 50) {
      reasons.push(`Nearby (${distanceKm.toFixed(0)}km)`);
    }
    if (activityScore > 0.7) {
      reasons.push('Active member');
    }
    
    // Only include if meets minimum score
    if (finalScore >= minScore) {
      recommendations.push({
        userId: candidate.id,
        score: finalScore,
        reasons,
        mutualFriends: connectionSim.mutualCount,
        sharedInterests: interestSim.sharedCount,
        distanceKm: distanceKm || undefined
      });
    }
  }
  
  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);
  
  // Apply limit
  return recommendations.slice(0, limit);
}
